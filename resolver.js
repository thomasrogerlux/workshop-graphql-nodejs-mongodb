const Lang = require("./Lang");

async function lang(parent, args, context) {
  const res = await Lang.find({ name: args.name });

  if (res.length < 1) {
    return null;
  }

  return res[0];
}

async function allLang(parent, args, context) {
  return Lang.find();
}

async function addLang(parent, args, context) {
  const newLang = new Lang({ name: args.name, ext: args.ext });

  const savedLang = await newLang.save();

  return savedLang;
}

async function deleteLang(parent, args, context) {
  const deletedLang = await Lang.findOneAndDelete({ name: args.name });

  return deletedLang;
}

module.exports = {
  lang,
  allLang,
  addLang,
  deleteLang
};
