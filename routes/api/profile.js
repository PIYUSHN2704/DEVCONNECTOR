const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
/**
 * @route GET api/profile/me
 * @desc Get Current User Profile
 * @access Private
 */

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({
        msg: "There is no Profile for this user",
      });
    }
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});
/**
 * @route Post api/profile/
 * @desc Create or Update User Profile
 * @access Private
 */

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required ").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build Profile Object
    const profileFilelds = {};
    profileFilelds.user = req.user.id;
    if (company) profileFilelds.company = company;
    if (website) profileFilelds.website = website;
    if (location) profileFilelds.location = location;
    if (bio) profileFilelds.bio = bio;
    if (status) profileFilelds.status = status;
    if (githubusername) profileFilelds.githubusername = githubusername;
    if (skills) {
      profileFilelds.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build Social Object
    profileFilelds.social = {};
    if (youtube) profileFilelds.social.youtube = youtube;
    if (twitter) profileFilelds.social.youtube = twitter;
    if (facebook) profileFilelds.social.youtube = facebook;
    if (linkedin) profileFilelds.social.youtube = linkedin;
    if (instagram) profileFilelds.social.youtube = instagram;

    try {
      let profile = await Profile.findOne({
        user: req.user.id,
      });
      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id,
          },
          {
            $set: profileFilelds,
          },
          {
            new: true,
          }
        );

        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFilelds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route GET api/profile
 * @desc Get all Profiles
 * @access Public
 */

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route GET api/profile/user/:user_id
 * @desc Get Profile by User ID
 * @access Public
 */

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this User" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).send({ msg: "There is no profile for the User" });
    }
    res.status(500).send("Server Error");
  }
});
/**
 * @route Delete  api/profile
 * @desc Delete Profile User & Posts
 * @access Private
 */

router.delete("/", auth, async (req, res) => {
  try {
    // To Do - remove User Posts

    // Remove Profiles
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User Deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route Put  api/profile/experience
 * @desc Add Profile experience
 * @access Private
 */

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is requiredj").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        console.log(profile);
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Sever Error");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route Delete   api/profile/experience/exp_id
 * @desc Delete Profile experience from Profile
 * @access Private
 */

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get the remove Index

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route Put  api/profile/education
 * @desc Add Profile education
 * @access Private
 */

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is requiredj").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      } = req.body;

      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        console.log(profile);
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Sever Error");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
/**
 * @route Delete   api/profile/education/edu_id
 * @desc Delete Profile education from Profile
 * @access Private
 */

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get the remove Index

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
