const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json())

app.get('/', (req, res) => {
   res.send('Hello World!')
})

/**login admin function*/
async function login(reqUsername, reqPassword) {
   return adminCollection.findOne({ username: reqUsername, password: reqPassword })
     .then(matchUsers => {
       if (!matchUsers) {
         return {
           success: false,
           message: "Admin not found!"
         };
       } else {
         return {
           success: true,
           users: matchUsers
         };
       }
     })
     .catch(error => {
         console.error('Error in login:', error);
         return {
           success: false,
           message: "An error occurred during login."
         };
       });
 }
 
 /**create admin function */
 async function register(reqUsername, reqPassword) {
   return adminCollection.insertOne({
     username: reqUsername,
     password: reqPassword,
     
   })
     .then(() => {
       return "Registration successful!";
     })
     .catch(error => {
       console.error('Registration failed:', error);
       return "Error encountered!";
     });
 }
 
 function generateToken(userData) {
   const token = jwt.sign(userData, 'inipassword');
   return token
 
 }
 
 function verifyToken(req, res, next) {
   let header = req.headers.authorization;
   console.log(header);
 
   let token = header.split(' ')[1];
 
   jwt.verify(token, 'inipassword', function (err, decoded) {
     if (err) {
       res.send('Invalid Token');
     }
 
     req.user = decoded;
     next();
   });
 }
 
 
app.post('/login', (req, res) => {
   console.log(req.body);
 
   let result = login(req.body.username, req.body.password);
   result.then(response => {
     console.log(response); // Log the response received
 
     if (response.success) {
       let token = generateToken(response.users);
       res.send(token);
     } else {
       res.status(401).send(response.message);
     }
   }).catch(error => {
     console.error('Error in login route:', error);
     res.status(500).send("An error occurred during login.");
   });
 });

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
 });

