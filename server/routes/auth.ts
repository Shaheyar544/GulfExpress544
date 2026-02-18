import { Router, type Request, type Response } from "express";
import { body, validationResult } from "express-validator";

const router = Router();

// Sample Signup Route with Validation
router.post(
    "/api/signup",
    // Validation Chain
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Please include a valid email"),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
    ],
    (req: Request, res: Response) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Proceed if validation passes
        const { name, email } = req.body;

        // In a real app, you would save the user here
        // For this sample, we just return success
        return res.status(201).json({
            message: "User registered successfully",
            user: { name, email },
        });
    }
);

export default router;
