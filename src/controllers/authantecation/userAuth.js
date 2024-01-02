import { USER } from '../../models/userModel.js';
import { transporter } from '../../utils/mailTransport.js';
import { generateToken, comparePassword, hashPassword, generateOTP, isOTPValid,
  passComparer, passHashing, sendEmail } from '../../utils';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

// Signup for both individual and organization clients
export const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, userType } = req.body;

    // Check if the email already exists
    const existingUser = await USER.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(409).json({
        message: 'Password and Confirm Password do not match',
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new user based on userType
    let newUser;
    if (userType === 'individual') {
      const { name, phone,userType} = req.body;
      newUser = await USER.create({
        userType,
        email,
        password: hashedPassword, 
        name,
        phone,
        
      });
    } else if (userType === 'organization') {
      // You might want to adjust these fields based on your organization requirements
      const { name, registrationNumber, phone, contactPerson, userType } = req.body;
      newUser = await USER.create({
        userType,
        email,
        password: hashedPassword,
        name,
        registrationNumber,
        phone,
        contactPerson,
        role: 'organization',
        
      });
    } else if (userType === 'author') {
        const { name, phone,userType} = req.body;
        newUser = await USER.create({
          userType,
          email,
          password: hashedPassword, 
          name,
          phone,
          role: 'author',
          isAuthor: 'pending',
        }); 
    }
    else {
      return res.status(400).json({
        message: 'Invalid user type',
      });
    }

    // Send a welcome email to the user
    const mailOptions = {
      from: 'gdushimimana6@gmail.com',
      to: newUser.email,
      subject: 'Welcome to Movie site',
      text: 'Thank you for signing up!',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending failed:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    const token = generateToken({
      id: newUser.id,
    });

    res.status(201).json({
      message: 'User registered successfully',
      access_token: token,
      USER: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        // Add other relevant fields based on userType
      },
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};
//##################################################################################
// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await USER.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Wrong password',
      });
    }

    const token = generateToken({
      id: user.id,
      role:user.role

    });

    res.status(200).json({
      message: 'User logged in successfully',
      access_token: token,
      USER: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};
//#######################################################
// Forgot Password
export const forgotPassword = async (req, res) => {
  const otp = generateOTP().code
  const expiresAt=generateOTP().expiresAt;
  const userEmail = req.body.email
  const user = await USER.findOne({ email: userEmail })
  if (!user) {
    return res
      .status(404)
      .json({
        message: `No user with email ${userEmail} found. Please use a correct registered email if you have ever signed up.`
      })
  }
  const hashedOTP = await passHashing(otp);
  user.otp = hashedOTP;
  user.otpExpiresAt=expiresAt;
  await user.save()
  await sendEmail(
    user.email,
    'Password OTP Code Reset',
    'Password Resetting!',
    `Use this ${otp} to change your password.  it is valid for five minutes  it will expire at ${expiresAt}`
  )

  return res
    .status(200)
    .json({
      message:
        'OTP sent successfully!! you can go to your email and came back with it.'
    })
}

//############################################################################

// Reset Password

export const resetPassword = async (req, res) => {
  const userEmail = req.body.email
  const user = await USER.findOne({ email: userEmail })
  if (!user) {
    return res
      .status(404)
      .json({
        message: `No user with email ${userEmail} found. Please use a correct registered email if you have ever signed up.`
      })
  }

  const receivedOTP = req.body.otp
  const storedOTP = user.otp;
  let validotp = isOTPValid(storedOTP, receivedOTP,user.otpExpiresAt,res)
  if (validotp) {
    const newpassword = req.body.newPassword;
    const hashedPassword = await hashPassword(newpassword)

    user.password = hashedPassword
    user.otp = undefined;
    user.otpExpiresAt=undefined;
    await user.save()
    return res.status(200).json({ message: 'Password updated successfully.' })
  }
  
}


//##################################################
// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req;
    const user = await USER.findById(userId);

    const isPasswordCorrect = await comparePassword(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Wrong password',
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

// Verify Client and Complete Profile
export const verifyClientAndCompleteProfile = async (req, res) => {
  try {
    const { userId } = req;
    const user = await USER.findById(userId);
    // Check if the user is not yet verified
    const userType = user.userType;
    
    if (!user.isVerified) {
      if (userType === 'individual') {
      // Update the user object with the provided form data
      const { name,phone, country, city, district, sector, cell, 
        nationalID } = req.body;

      user.name = name || user.name;
      user.country = country || user.country;
      user.city = city || user.city;
      user.district = district || user.district;
      user.sector = sector || user.sector;
      user.cell = cell || user.cell;
      user.nationalID = nationalID || user.nationalID;
      user.phone = phone || user.phone;
    
      // Check for file upload
      if (req.files && req.files['photo'] && req.files['photo'][0]) {
        // Upload the photo to Cloudinary
        const result = await cloudinary.uploader.upload(req.files['photo'][0].path);

        // Update the user's photo URL with the Cloudinary URL
        user.photo = result.secure_url;
      }
      else if (req.files && req.files['documents'] && req.files['documents'][0]) {
        // Upload the document to Cloudinary
        const result = await cloudinary.uploader.upload(req.files['documents'][0].path);

        // Update the user's document URL with the Cloudinary URL
        user.documents = result.secure_url;
      }
    } else if (userType === 'organization') {
      // Update the user object with the provided form data
      const {name,registrationNumber,
         phone, country, city, district, sector, cell, contactPerson } = req.body;

      
      user.name = name || user.name;
      user.registrationNumber = registrationNumber || user.registrationNumber;
      user.contactPerson = contactPerson || user.contactPerson;
      user.country = country || user.country;
      user.city = city || user.city;
      user.district = district || user.district;
      user.sector = sector || user.sector;
      user.cell = cell || user.cell;
   
      user.phone = phone || user.phone;
    
      // Check for file upload
      if (req.files && req.files['photo'] && req.files['photo'][0]) {
        // Upload the photo to Cloudinary
        const result = await cloudinary.uploader.upload(req.files['photo'][0].path);

        // Update the user's photo URL with the Cloudinary URL
        user.photo = result.secure_url;
      }
      else if (req.files && req.files['documents'] && req.files['documents'][0]) {
        // Upload the document to Cloudinary
        const result = await cloudinary.uploader.upload(req.files['documents'][0].path);

        // Update the user's document URL with the Cloudinary URL
        user.documents = result.secure_url;
      }
  }
  else if (userType === 'author') {
    // Update the user object with the provided form data
    const {name, phone, country, city, district, sector, cell,nationalID, category , documents} = req.body;

    
       user.name = name || user.name;
       user.country = country || user.country;
       user.city = city || user.city;
       user.district = district || user.district;
       user.sector = sector || user.sector;
       user.cell = cell || user.cell;
       user.nationalID = nationalID || user.nationalID;
       user.phone = phone || user.phone;
       user.category = category || user.category;
       user.documents = documents || user.documents;
      
  
    // Check for file upload
    if (req.files && req.files['photo'] && req.files['photo'][0]) {
      // Upload the photo to Cloudinary
      const result = await cloudinary.uploader.upload(req.files['photo'][0].path);

      // Update the user's photo URL with the Cloudinary URL
      user.photo = result.secure_url;
    }
    else if (req.files && req.files['documents'] && req.files['documents'][0]) {
      // Upload the document to Cloudinary
      const result = await cloudinary.uploader.upload(req.files['documents'][0].path);

      // Update the user's document URL with the Cloudinary URL
      user.documents = result.secure_url;
    }
}
      // Mark the user as verified
      user.isVerified = true;
      await user.save();
    }

    return res.status(200).json({
      message: 'User is verified',
    });
  } catch (error) {
    console.error('Error in verifyClientAndCompleteProfile:', error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

// Get All Clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await USER.find();
    res.status(200).json({
      message: 'All clients',
      clients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

//delete client by id 
export const deleteClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await USER.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({
        message: 'Client not found',
      });
    }
    res.status(200).json({
      message: 'Client deleted successfully',
      client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};
