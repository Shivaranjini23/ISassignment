/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     SessionIdentifier:
 *       type: apiKey
 *       in: header
 *       name: x-session-identifier
 */

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Authenticate admin and generate a new token.
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
 *         description: Admin login successful.
 *       401:
 *         description: Invalid credentials. Please try again.
 *       500:
 *         description: An error occurred during login.
 */

/**
 * @openapi
 * /issueVisitorPass:
 *   post:
 *     summary: Issue a visitor pass for an authenticated admin.
 *     security:
 * parameters:
 *       - in: header
 *         name: x-session-identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: Session identifier for authentication.
 * security:
 *       - BearerAuth: []
 *       - SessionIdentifier: []
 *     requestBody:
 *       # ... (Your request body details)
 *     responses:
 *       200:
 *         description: Visitor pass issued successfully.
 *       401:
 *         description: Unauthorized: Admin authentication required or session expired.
 *       404:
 *         description: Visitor not found. Please register the visitor first.
 *       500:
 *         description: An error occurred issuing the visitor pass.
 */

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new admin with additional details.
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
 * @openapi
 * /createvisitorData:
 *   post:
 *     summary: Create a new visitor with details.
 *     security:
 *       - BearerAuth: []  
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
 * @openapi
 * /visitor/login:
 *   post:
 *     summary: Authenticate a visitor and generate a new token.
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
 *     summary: Retrieve the visitor pass for an authenticated visitor.
 * parameters:
 *       - in: header
 *         name: x-session-identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: Session identifier for authentication.   
 * security:
 *       - BearerAuth: []
 *       - SessionIdentifier: []
 *     responses:
 *       200:
 *         description: Visitor pass retrieved successfully.
 *       401:
 *         description: Unauthorized: Visitor authentication required.
 *       404:
 *         description: Visitor pass not found.
 *       500:
 *         description: Error retrieving visitor pass.
 *     security:
 *       - BearerAuth: []
 *     

/**
 * @openapi
 * /visitors:
 *   get:
 *     summary: View all visitors (protected route for authenticated admins only).
 * parameters:
 *       - in: header
 *         name: x-session-identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: Session identifier for authentication.
 * security:
 *       - BearerAuth: []
 *       - SessionIdentifier: []
 *     responses:
 *       200:
 *         description: Visitors retrieved successfully.
 *       401:
 *         description: Unauthorized: Admin authentication required.
 *       500:
 *         description: Error viewing visitors.
 */
