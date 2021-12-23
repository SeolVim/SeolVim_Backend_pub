const router = require('express').Router()
const controller = require('./controller')
const authMiddleware = require('../../middlewares/auth')
const multer = require('multer')

//for multer
const storage = multer.diskStorage({
    destination(request, file, cb) {
        cb(null, 'scripts/')
    },
    filename: (req, file, cb) => {
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }

})
const upload = multer({storage: storage})

//for download


router.post('/signup', controller.signUp)
router.post('/signin', controller.signIn)

router.use('/user', authMiddleware)
router.use('/check', authMiddleware)
router.get('/check', controller.check)

router.get('/signout', controller.signOut)

//router.get('/user', controller.view)

//router.use('/user/:email', authMiddleware)
//router.get('/user/:email', controller.view)

//router.use('/profile', authMiddleware)
//router.put('/profile',upload.single('file'),controller.editProfile)

//router.use('/user', authMiddleware)
//router.put('/user',controller.editNickname)

router.use('/script', authMiddleware)

router.get('/script', controller.getScript)
router.post('/script', upload.single('file'), controller.createScript)


module.exports = router