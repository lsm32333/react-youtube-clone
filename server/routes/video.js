const express = require('express');
const router = express.Router();
// const { Video } = require("../models/Video");

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

module.exports = router;
