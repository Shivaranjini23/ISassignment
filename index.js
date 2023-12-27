const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;
const swaggerui = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const swaggerjsdoc = require('swagger-jsdoc');

app.use(express.json())

// MongoDB connection URL
const uri = "mongodb+srv://shivaranjini2:4f8GZeWiJmGhRlEx@cluster0.k1veqjb.mongodb.net/?retryWrites=true&w=majority";

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }, {serverApi:
    {version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
}
});

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Define collection names
const db = client.db('vms');
const adminCollection = db.collection ('admin');
const visitorCollection = db.collection ('visitor');
const prisonerCollection = db.collection('prisoner');

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
  
    // Check if the Authorization header is present
    if (!header) {
      return res.status(401).send('Authorization header is missing');
    }
  
    console.log(header);
  
    // Split the header to extract the token
    let tokenParts = header.split(' ');
  
    // Check if the expected token format is present
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
      return res.status(401).send('Invalid Authorization header format');
    }
  
    let token = tokenParts[1];
  
    jwt.verify(token, 'inipassword', function (err, decoded) {
      if (err) {
        return res.status(401).send('Invalid Token');
      }
  
      req.user = decoded;
      next();
    });
  }

app.get('/', (req, res) => {
   res.send('Hello World!')
})

// Login Admin
app.post('/login', (req, res) => {
    console.log(req.body);
  
    let result = login(req.body.username, req.body.password);
    result.then(response => {
      console.log(response); // Log the response received
  
      if (response.success) {
        let token = generateToken(response.users);
        res.send("Auth Token: " + token);
      } else {
        res.status(401).send(response.message);
      }
    }).catch(error => {
      console.error('Error in login route:', error);
      res.status(500).send("An error occurred during login.");
    });
});

// Register Admin
app.post('/register', (req, res) => {
    console.log(req.body);
  
    let result = register(req.body.username, req.body.password, req.body.name, req.body.email);
    result.then(response => {
      res.send(response);
    }).catch(error => {
      console.error('Error in register route:', error);
      res.status(500).send("An error occurred during registration.");
    });
});

// Add a visitor
app.post('/createvisitorData', verifyToken, (req, res) => {
    const {
      name,
      icnumber,
      relationship,
      prisonerId
    } = req.body;
  
    const visitorData = {
      name,
      icnumber,
      relationship,
      prisonerId
    };
  
    visitorCollection
      .insertOne(visitorData)
      .then(() => {
        res.send(visitorData);
      })
      .catch((error) => {
        console.error('Error creating visitor:', error);
        res.status(500).send('An error occurred while creating the visitor');
      });
});

// Add a prisoner
app.post('/addprisoner', verifyToken, (req, res) => {
    const {
      name,
      icnumber,
      prisonerId
    } = req.body;
  
    const prisonerData = {
      name,
      icnumber,
      prisonerId
    };
  
    prisonerCollection
      .insertOne(prisonerData)
      .then(() => {
        res.send(prisonerData);
      })
      .catch((error) => {
        console.error('Error creating prisoner:', error);
        res.status(500).send('An error occurred while creating the prisoner');
      });
});

// View all visitors
app.get('/visitors', async (req, res) => {
    try {
      const db = client.db('vms');
      const prisoner = await db.collection('visitor').find().toArray();
      res.send(prisoner);
    } catch (error) {
      res.status(500).send('Error viewing visitors');
    }
});

// View all prisoner
app.get('/prisoner', async (req, res) => {
    try {
      const db = client.db('vms');
      const prisoner = await db.collection('prisoner').find().toArray();
      res.send(prisoner);
    } catch (error) {
      res.status(500).send('Error viewing prisoner');
    }
  });

const options = {
    definition: {
        openapi: '3.0.0',
        servers: [
            {
              url: 'https://vmsprison.azurewebsites.net',
            },
          ],          
        info: {
            title: 'VMS PRISON API',
            version: '1.0.0',
        },
    },
    apis: ['./main.js'],
};

const specs = swaggerjsdoc(options);
app.use('/api-docs', swaggerui.serve, swaggerui.setup(specs));

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
})