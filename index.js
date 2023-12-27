const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;
// Declare global data structures to store active tokens
const activeTokens = {}; // For admin tokens
const activeVisitorTokens = {}; // For visitor tokens
const cors = require('cors');
const ejs = require('ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');




// Enable CORS
app.use(cors());


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prison VMS API',
      version: '1.0.0',
      description: 'API documentation for Prison VMS',
    },
    servers: [
      {
        url: 'https://prisonvms.azurewebsites.net/api-docs',
      },
    ],
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
      SessionIdentifier: {
        type: 'apiKey',
        name: 'x-session-identifier',
        in: 'header',
      },
    },
  },
  apis: ['./swagger.js'], // 
};

const specs = swaggerJsdoc(options);

// MongoDB connection URL
const uri = "mongodb+srv://shivaranjini2:4f8GZeWiJmGhRlEx@cluster0.k1veqjb.mongodb.net/?retryWrites=true&w=majority";


// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Define collection names
const db = client.db('PRISON_VMS');
const adminCollection = db.collection ('ADMIN');
const visitorCollection = db.collection ('VISITOR');
const prisonerCollection = db.collection('PRISONER');
const cellCollection = db.collection('CELL');
const emergencyCollection = db.collection('EMERGENCY_CONTACT');
const casedetailCollection = db.collection('CASE_DETAILS');
const visitorPassCollection = db.collection('VISITORPASS')

/**login admin function*/
async function login(reqUsername, reqPassword) {
  try {
    const matchUsers = await adminCollection.findOne({ username: reqUsername, password: reqPassword });

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
  } catch (error) {
    console.error('Error in login:', error);
    return {
      success: false,
      message: "An error occurred during login."
    };
  }
}

/**create admin function */
async function register(reqUsername, reqPassword, reqName, reqAge, reqGender) {
  try {
    await adminCollection.insertOne({
      username: reqUsername,
      password: reqPassword,
      name: reqName,
      age: reqAge,
      gender: reqGender,
    });

    return "Registration successful!";
  } catch (error) {
    console.error('Registration failed:', error);
    return "Error encountered!";
  }
}


function generateToken(userData) {
  const token = jwt.sign(userData, 'inipassword');
  return token

}

const jwtSecret = 'inipassword';

function verifyToken(req, res, next) {
  let header = req.headers.authorization;

  // Check if Authorization header exists
  if (!header) {
    return res.status(401).send('Unauthorized: Missing Authorization header');
  }

  // Split the header to get the token
  let token = header.split(' ')[1];

  // Check if the token is missing
  if (!token) {
    return res.status(401).send('Unauthorized: Token missing');
  }

  jwt.verify(token, jwtSecret, function (err, decoded) {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).send('Unauthorized: Token expired');
      } else {
        res.status(401).send('Unauthorized: Invalid token');
      }
    } else {
      req.user = decoded;
      next();
    }
  });
}


// Serve the login page
app.get('/loginpage', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Function to generate a session identifier
function generateSessionIdentifier() {
  // Implement your logic to generate a unique session identifier
  // Example: You can use a combination of timestamp and a random number
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `Session_${timestamp}_${random}`;
}


app.post('/login', async (req, res) => {
  try {
    const response = await login(req.body.username, req.body.password);

    if (response.success) {
      const newToken = generateToken(response.users);
      const sessionIdentifier = generateSessionIdentifier();

      activeTokens[response.users.username] = { token: newToken, session: sessionIdentifier };

      const responseData = {
        message: 'Admin login successful!',
        token: newToken,
        session: sessionIdentifier
      };

      res.status(200).json(responseData);
    } else {
      res.status(401).json({ message: "Invalid credentials. Please try again." });
    }
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ message: "An error occurred during login." });
  }
});

  

// Issue Visitor Pass for Authenticated Admin
app.post('/issueVisitorPass', verifyToken, async (req, res) => {
  try {
    // Check if the request is coming from an authenticated admin
    if (req.user && req.user.username) {
      // Check if the visitor is registered
      const visitor = await visitorCollection.findOne({ visitorId: req.body.visitorId });

      if (!visitor) {
        return res.status(404).send('Visitor not found. Please register the visitor first.');
      }

      // Check if the stored session identifier matches the one in the request
      const storedSessionIdentifier = activeTokens[req.user.username]?.session;
      const requestSessionIdentifier = req.headers['x-session-identifier']; // Include session identifier in the request headers

      if (storedSessionIdentifier !== requestSessionIdentifier) {
        return res.status(401).send('Unauthorized: Session expired. Please login again!');
      }

      // Place your logic here to issue a visitor pass
      // Example: Generate a pass and store it in the database
      const passNumber = generatePassNumber();
      const visitorPass = {
        passNumber: passNumber,
        issuedBy: req.user.username,
        visitorId: req.body.visitorId,
        // Add other pass details as needed
      };

      // Store the visitor pass details in the database or perform any other actions
      await visitorPassCollection.insertOne(visitorPass);

      // Log the pass number and visitor name to the terminal
      console.log(`Visitor Pass Issued 
         Visitor Name: ${visitor.name}
         Pass Number: ${passNumber} `);

      const responseMessage = `Visitor pass issued successfully! 
         Visitor Name: ${visitor.name}
         Pass Number: ${passNumber}`;
      res.status(200).send(responseMessage);
    } else {
      res.status(401).send('Unauthorized: Admin authentication required.');
    }
  } catch (error) {
    console.error('Error issuing visitor pass:', error);
    res.status(500).send('Error issuing visitor pass');
  }
});

// Function to generate a unique visitor pass number
function generatePassNumber() {
  // Implement your logic to generate a unique pass number
  // Example: You can use a combination of timestamp and a random number
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `VP${timestamp}${random}`;
}


// Register Admin with additional details
app.post('/register', async (req, res) => {
  console.log(req.body);

  // Check if an admin with the same username already exists
  const existingAdmin = await adminCollection.findOne({ username: req.body.username });

  if (existingAdmin) {
    // Admin with the same username already exists
    return res.status(400).send('Username already exists. Please choose a different username.');
  }

  // If the username is unique, proceed with registration
  let result = register(req.body.username, req.body.password, req.body.name, req.body.age, req.body.gender);
  result.then(response => {
    res.send(response);
  }).catch(error => {
    console.error('Error in register route:', error);
    res.status(500).send("An error occurred during registration.");
  });
});



// Create a visitor
app.post('/createvisitorData', verifyToken, async (req, res) => {
  const {
    name,
    city,
    relationship,
    visitorId,
    username,  // Add username to the request body
    password,  // Add password to the request body
  } = req.body;

  const visitorData = {
    name,
    city,
    relationship,
    visitorId,
    username,  // Include username in the visitor data
    password,  // Include password in the visitor data
  };

  // Check if the username is unique before inserting into the database
  const existingVisitor = await visitorCollection.findOne({ username });
  if (existingVisitor) {
    return res.status(400).send('Username already exists. Please choose a different username.');
  }

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


// Visitor login
app.post('/visitor/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const visitor = await visitorCollection.findOne({ username, password });

    if (visitor) {
      // Generate a new token
      const newToken = generateToken({ username: visitor.username, password: visitor.password });

      // Store the new token with a session identifier
      const sessionIdentifier = generateSessionIdentifier(); // Implement this function
      activeVisitorTokens[visitor.username] = { token: newToken, session: sessionIdentifier };

      // Send the new token and session identifier in the response
      const responseMessage = `Visitor login successful! 
      Token: ${newToken}
      Session: ${sessionIdentifier}`;
      res.send(responseMessage);
    } else {
      res.status(401).send('Visitor login failed. Invalid credentials.');
    }
  } catch (error) {
    console.error('Error in visitor login route:', error);
    res.status(500).send('An error occurred during visitor login.');
  }
});



// Retrieve Visitor Pass for Authenticated Visitor
app.get('/visitor/retrievepass', verifyToken, async (req, res) => {
  try {
    // Check if the request is coming from an authenticated visitor
    if (req.user && req.user.username) {
      // Check if the stored session identifier matches the one in the request
      const storedSessionIdentifier = activeVisitorTokens[req.user.username]?.session;
      const requestSessionIdentifier = req.headers['x-session-identifier']; // Include session identifier in the request headers

      if (storedSessionIdentifier !== requestSessionIdentifier) {
        return res.status(401).send('Unauthorized: Session expired. Please login again!');
      }

      // Retrieve the visitor pass based on the visitor's information
      const visitorPass = await visitorPassCollection.findOne({ visitorId: req.user.visitorId });

      if (visitorPass) {
        res.send(`Your Visitor Pass Number: ${visitorPass.passNumber}`);
      } else {
        res.status(404).send('Visitor pass not found.');
      }
    } else {
      res.status(401).send('Unauthorized: Visitor authentication required.');
    }
  } catch (error) {
    console.error('Error retrieving visitor pass:', error);
    res.status(500).send('Error retrieving visitor pass');
  }
});



// View all visitors (protected route for authenticated admins only)
app.get('/visitors', verifyToken, async (req, res) => {
  // Check if the request is coming from an authenticated admin
  if (req.user && req.user.username) {

    // Check if the stored session identifier matches the one in the request
    const storedSessionIdentifier = activeTokens[req.user.username]?.session;
    const requestSessionIdentifier = req.headers['x-session-identifier']; // Include session identifier in the request headers

    if (storedSessionIdentifier !== requestSessionIdentifier) {
      return res.status(401).send('Unauthorized: Session expired. Please login again!');
    }
    try {
      const visitors = await visitorCollection.find().toArray();
      res.send(visitors);
    } catch (error) {
      res.status(500).send('Error viewing visitors');
    }
  } else {
    res.status(401).send('Unauthorized: Admin authentication required.');
  }
});





//Delete a visitor
app.delete('/deletevisitor/:id', verifyToken, async (req, res) => {
  const objectId = new ObjectId(req.params);
  

  try {
    const deleteResult = await db.collection('VISITOR').deleteOne({ _id:objectId });

    if (deleteResult.deletedCount === 1) {
      res.send('Visitor deleted successfully');
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).send('Error deleting visitor');
  }
});


// View all admins
app.get('/admins', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const prisoner = await db.collection('ADMIN').find().toArray();
    res.send(prisoner);
  } catch (error) {
    res.status(500).send('Error viewing admins');
  }
});


// View all prisoner
app.get('/prisoner', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const prisoner = await db.collection('PRISONER').find().toArray();
    res.send(prisoner);
  } catch (error) {
    res.status(500).send('Error viewing prisoner');
  }
});


// View all cell
app.get('/cell', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const cell = await db.collection('CELL').find().toArray();
    res.send(cell);
  } catch (error) {
    res.status(500).send('Error viewing cell');
  }
});


// View all emergency_contact
app.get('/emergency', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const emergency = await db.collection('EMERGENCY_CONTACT').find().toArray();
    res.send(emergency);
  } catch (error) {
    res.status(500).send('Error viewing emergency_contact');
  }
});


// View all case_details
app.get('/casedetail', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const casedetail = await db.collection('CASE_DETAILS').find().toArray();
    res.send(casedetail);
  } catch (error) {
    res.status(500).send('Error viewing emergency_contact');
  }
});

app.use(express.json())

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});