const { create } = require('domain');
const express = require('express'); 
const app = express();

const fs = require('fs');

const multer = require('multer');

const { createWorker } = require('tesseract.js');

// create Storage
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    
    filename: function (req, file, cb) {
        cb(null, '1.png');
    }
})

//upload image
const upload = multer({ storage: storage })
.single('avatar');

//set view engine
app.set('view engine', 'ejs');

app.use(express.static("public"));

//Get route
app.get('/', (req, res) => {
    res.render('index');
})

app.get('/used', (req, res) => {
    res.render('used');
});


app.post('/uploads', (req, res) => {
    upload(req, res, err => {
        fs.readFile('./uploads/1.png', (err, dat) => {
            if(err) return console.log("Error");
            

            const worker = createWorker({
                logger: m => console.log(m), // Add logger here
              });

              
            //   (async () => {
            //     await worker.load();
            //     await worker.loadLanguage('eng');
            //     await worker.initialize('eng');
            //     const { data: { text } } = await worker.recognize(data);
            //     console.log(text);
            //     res.send(text);
            //     await worker.terminate();
            //   })();


            (async () => {
                const worker = createWorker();
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const { data: { text } } = await worker.recognize(dat);
                console.log(text);
                // res.send(text);
                res.redirect('/download');
                const { data } = await worker.getPDF('Tesseract OCR Result');
                fs.writeFileSync('tesseract-ocr-result.txt', Buffer.from(text));
                console.log('Generate PDF: tesseract-ocr-result.pdf');
                await worker.terminate();
              })();


            
            
        })
    })
})

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract-ocr-result.txt`;
    res.download(file);
})


//listen  on default port 3000
const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => {
    console.log('started');
})




