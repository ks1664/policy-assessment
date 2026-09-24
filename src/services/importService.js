const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const Agent = require('../models/Agent');
const User = require('../models/User');
const UserAccount = require('../models/UserAccount');
const LOB = require('../models/LOB');
const Carrier = require('../models/Carrier');
const Policy = require('../models/Policy');

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function readXlsx(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
}

async function readFile(filePath) {
  if (!filePath) {
    throw new Error('File path is missing');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const stats = fs.statSync(filePath);

  if (!stats.isFile()) {
    throw new Error(
      `Expected a file but received: ${filePath}`
    );
  }

  const extension = path.extname(filePath).toLowerCase();

  console.log('Reading file:', filePath);
  console.log('File extension:', extension);

  if (extension === '.csv') {
    return readCsv(filePath);
  }

  if (extension === '.xlsx' || extension === '.xls') {
    return readXlsx(filePath);
  }

  throw new Error(
    `Unsupported file type: ${extension || 'unknown'}`
  );
}

async function findOrCreate(model, filter, data = filter) {
  return model.findOneAndUpdate(filter, { $setOnInsert: data }, { new: true, upsert: true });
}

async function importRows(rows) {
  let imported = 0;

  for (const row of rows) {
    const agentName = clean(row.agent);
    const firstName = clean(row.firstname);
    const email = clean(row.email).toLowerCase();
    const phone = clean(row.phone);
    const accountName = clean(row.account_name);
    const categoryName = clean(row.category_name);
    const companyName = clean(row.company_name);
    const policyNumber = clean(row.policy_number);

    if (!policyNumber || !firstName) continue;

    const agent = agentName
      ? await findOrCreate(Agent, { name: agentName })
      : null;

    // Email is the preferred identity. For rows without email, the combination
    // of name + phone + address prevents unrelated users from being merged.
    const userFilter = email
      ? { email }
      : { firstName, phone, address: clean(row.address) };

    const user = await findOrCreate(User, userFilter, {
      firstName,
      dob: parseDate(row.dob),
      address: clean(row.address),
      phone,
      state: clean(row.state),
      zipCode: clean(row.zip),
      email,
      gender: clean(row.gender),
      userType: clean(row.userType)
    });

    const account = accountName
      ? await findOrCreate(UserAccount, { accountName, userId: user._id }, { accountName, userId: user._id })
      : null;

    const category = categoryName
      ? await findOrCreate(LOB, { categoryName })
      : null;

    const carrier = companyName
      ? await findOrCreate(Carrier, { companyName })
      : null;

    await Policy.updateOne(
      { policyNumber },
      {
        $set: {
          policyStartDate: parseDate(row.policy_start_date),
          policyEndDate: parseDate(row.policy_end_date),
          agentId: agent?._id,
          userId: user._id,
          accountId: account?._id,
          categoryId: category?._id,
          carrierId: carrier?._id
        }
      },
      { upsert: true }
    );

    imported += 1;
  }

  return imported;
}

module.exports = { readFile, importRows };
