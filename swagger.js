/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     SessionIdentifier:
 *       type: apiKey
 *       in: header
 *       name: x-session-identifier
 */


/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin operations
 *   - name: Visitor
 *     description: Visitor operations
 */
 
/**
 * @openapi
 * /login:
 *   post:
 *     summary: Admin login
 *     description: Log in as an admin to obtain an authentication token.
 *     tags:
 *       - Admin
 *     requestBody:
 *       description: Admin credentials for login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Admin username.
 *               password:
 *                 type: string
 *                 description: Admin password.
 *     responses:
 *       200:
 *         description: Successful login response
 *       401:
 *         description: Invalid credentials. Please try again.
 *       500:
 *         description: Internal server error
 */



/**
/**
 * @openapi
 * /issueVisitorPass:
 *   post:
 *     summary: Issue visitor pass for authenticated admin
 *     description: Issue a visitor pass for an authenticated admin. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *       - SessionIdentifier: []
 *     requestBody:
 *       description: Visitor details for pass issuance
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visitorId:
 *                 type: string
 *                 description: ID of the visitor for whom the pass is issued.
 *               visitorName:
 *                 type: string
 *                 description: Name of the visitor for whom the pass is issued.
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - Admin authentication required or session expired
 *       404:
 *         description: Visitor not found. Please register the visitor first.
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new admin with additional details.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful.
 *       400:
 *         description: Username already exists. Please choose a different username.
 *       500:
 *         description: An error occurred during registration.
 */
// 

/**
 * @swagger
 * /createvisitorData:
 *   post:
 *     summary: Create a new visitor with details.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               relationship:
 *                 type: string
 *               visitorId:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visitor created successfully.
 *       400:
 *         description: Username already exists. Please choose a different username.
 *       500:
 *         description: An error occurred while creating the visitor.
 */

/**
 * @swagger
 * /visitor/login:
 *   post:
 *     summary: Authenticate a visitor and generate a new token.
 *     tags: [Visitor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visitor login successful.
 *       401:
 *         description: Visitor login failed. Invalid credentials.
 *       500:
 *         description: An error occurred during visitor login.
 */

/**
 * @openapi
 * /visitor/retrievepass:
 *   get:
 *     summary: Retrieve visitor pass information
 *     description: Retrieve the visitor pass based on the visitor's information.
 *     tags:
 *       - Visitor
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - Session expired or visitor authentication required
 *       404:
 *         description: Visitor pass not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /visitors:
 *   get:
 *     summary: View all visitors (protected route for authenticated admins only)
 *     description: Retrieve a list of all visitors. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - Admin authentication required or session expired
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /deletevisitor/{id}:
 *   delete:
 *     summary: Delete a visitor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the visitor to delete
*/