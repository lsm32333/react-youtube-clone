const express = require('express');
const router = express.Router();
const { Video } = require("../models/Video");
var ffmpeg = require("fluent-ffmpeg");

const { auth } = require("../middleware/auth");
const multer = require("multer");

// STORAGE MULTER CONFIG
let storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, "uploads/");
    },
    filename: (req, file, cd) => {
        cd(null, `${Date.now()}_${file.originalname}`);
    },
    fileFilter: (req, file, cd) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cd(res.status(400).end('only mp4 is allower'), false);
        }
        cd(null, true)
    }
});

const upload = multer({ storage: storage }).single("file");


//=================================
//             Video
//=================================

router.post('/uploadfiles', (req, res) => {

    // 비디오를 서버에 저장한다.
    upload(req, res, err => {
        if(err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, url: res.req.file.path, fileName: res.req.file.filename })
    })

})

router.post('/uploadVideo', (req, res) => {

    // 비디오를 정보들을 저장한다.
    
    const video = new Video(req.body)

    video.save((err, doc) => {
        if(err) return res.json({ success:false, err })
        res.status(200),json({ success: true })
    })

})


router.post('/thumbnail', (req, res) => {

    // 썸내일 생성 하고 비디오 러닝타임도 가져오기

    let filePath = ""
    let fileDuration = ""

    // 비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function (err, metadata) {
        console.dir(metadata); // all metadata
        console.log(metadata.format.duration);
        
        fileDuration = metadata.format.duration
    });

    // 썸네일 생성
    ffmpeg(req.body.url)
    .on('filenames', function (filenames) {
        console.log('Will generate ' + filenames.join(', '))
        console.log(filenames)

        filePath = "uploads/thumbnails/" + filenames[0]
    })
    .on('end', function () {
        console.log('Screenshots taken');
        return res.json({ success: true, url: filePath, fileDuration: fileDuration})
    })
    .on('error', function (err) {
        console.error(err);
        return res.json({ success: false, err });
    })
    .screenshot({
        // Will take screenshots at 20%, 40%, 60% and 80% of the video
        count: 3,
        folder: 'uploads/thumbnails',
        size: '320x240',
        // '%b: input basename (filename w/o extension)
        filename: 'thumbnail-%b.png'
    })
})

module.exports = router;
