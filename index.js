const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');


app.use(express.json());
app.use(bodyParser.json());

// MongoDB connection URL
const uri = "mongodb+srv://shivaranjini2:4f8GZeWiJmGhRlEx@cluster0.k1veqjb.mongodb.net/?retryWrites=true&w=majority";


// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
    name: reqName,
    age:reqAge,
    gender:ReqGender
    
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

  // Check if Authorization header exists
  if (!header) {
    return res.status(401).send('Unauthorized: Missing Authorization header');
  }

  console.log(header);

  let token = header.split(' ')[1];

  jwt.verify(token, 'inipassword', function (err, decoded) {
    if (err) {
      res.status(401).send('Invalid Token');
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


// Login Admin
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


// Issue Visitor Pass for Authenticated Admin
app.post('/issueVisitorPass', verifyToken, async (req, res) => {
  // Check if the request is coming from an authenticated admin
  if (req.user && req.user.username) {
    // Check if the visitor is registered
    const visitor = await visitorCollection.findOne({ visitorId: req.body.visitorId });

    if (!visitor) {
      return res.status(404).send('Visitor not found. Please register the visitor first.');
    }

    // Place your logic here to issue a visitor pass
    // Example: Generate a pass and store it in the database
    const passNumber = generatePassNumber();
    const visitorPass = {
      passNumber: passNumber,
      issuedBy: req.user.username,
      visitorId: req.body.visitorId, // Associate the pass with the visitor
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
});


// Function to generate a unique visitor pass number
function generatePassNumber() {
  // Implement your logic to generate a unique pass number
  // Example: You can use a combination of timestamp and a random number
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `VP${timestamp}${random}`;
}


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


// Visitor Login
app.post('/visitor/login', async (req, res) => {
  const { username, password } = req.body;

  // Perform visitor authentication logic (e.g., check against a visitors collection in MongoDB)
  // Replace this with your actual authentication logic

  const visitor = await visitorCollection.findOne({ username, password });

  if (visitor) {
    // Generate a token for the visitor (you can use the same generateToken function as for admin)
    const token = generateToken({ username: visitor.username, role: 'visitor' });
    res.send(token);
  } else {
    res.status(401).send('Visitor login failed. Invalid credentials.');
  }
});

// Retrieve Visitor Pass Number for Authenticated Visitor
app.get('/visitor/pass', verifyToken, async (req, res) => {
  // Check if the request is coming from an authenticated visitor
  if (req.user && req.user.role === 'visitor') {
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
});



//update visitor
app.patch('/updatevisitor/:id', verifyToken, async (req, res) => {
  try {
    const objectId = new ObjectId(req.params.id);
    const {city} = req.body;

    const updateResult = await db.collection('VISITOR').updateOne(
      { _id: objectId }, 
      { $set: {city} });

    if (updateResult.modifiedCount === 1) {
      res.send('Visitor data successfully updated!');
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error('Error updating visitor data:', error);
    res.status(500).send('Error updating visitor data');
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




// View all visitors (protected route for authenticated admins only)
app.get('/visitors', verifyToken, async (req, res) => {
  // Check if the request is coming from an authenticated admin
  if (req.user && req.user.username) {
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