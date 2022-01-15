const express = require('express')
const multer = require('multer')
const cors = require('cors')
const cloudinary = require('cloudinary');
const res = require('express/lib/response');
const { Pool } = require('pg')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const app = express()
const port = process.env.PORT || 3001
const upload = multer({ dest: 'uploads/' })

let pool;
if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })
} else {
  pool = new Pool({
    database: 'undeniable_dynamos',
    password: 'test'
  })
}

const clientSideURL = process.env.NODE_ENV === 'production' ? 'https://undeniabledynamos.com/' : 'http://localhost:3000'
app.use(cors({ origin: clientSideURL }))

app.use(express.urlencoded({ extended: true }))

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

// app.get('/api/brands', () => {
//   pool
//     .query("SELECT * FROM brands;")
//     .then((dbRes) => res.json({ brands: dbRes }))
// })

app.post('/upload_logo', upload.single('logo'), (req, res) => {
  cloudinary.v2.uploader.upload(req.file.path, { folder: 'UndeniableDynamos' }, (err, img) => {
    pool
      .query("INSERT INTO brands(company_name, company_url, user_type, involvement, logo_url) VALUES ($1, $2, $3, $4, $5);", [req.body.companyName, req.body.companyUrl, req.body.userType, req.body.involvement, img.secure_url])
      .then(() => res.redirect('http://localhost:3000'))
  })
})
