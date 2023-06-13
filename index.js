const express = require('express');
const bcrypt = require('bcrypt');
const session = require("express-session");
const connectToMongoDB = require('./db');
const app = express();
const path = require('path');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'dhanush1234#',
  resave: false,
  saveUninitialized: false,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/html/index.html'));
  });
  app.post('/', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'users');
      const { email, password } = req.body;
      console.log(req.body);
      const user = await collection.findOne({'email': email});
      console.log(user);
      if (user) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          req.session.name = user.username;
          req.session.email = email;
          req.session.public  = true;
          res.status(200).json({ message: 'Login successful' });
        } else {
          res.status(401).json({ error: 'Invalid password' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
      client.close();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'views/html/signup.html'))
  });
  app.post('/signup', async (req, res) => {
    try {
      console.log(req.body);
      const { username, email, password, mobileNumber, dateOfBirth, gender, aadharNumber } = req.body;

      const { client, db, collection } = await connectToMongoDB('Vaccination', 'users');
  
      const collectionExists = await db.listCollections({ name: 'users' }).hasNext();

      if (!collectionExists) {
        await collection.createIndex({ email: 1 }, { unique: true });
        console.log('Unique key index created for email field');
      }
  

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        const hashedPassword = await bcrypt.hash(password, salt);

      const userDocument = {
        username,
        email,
        password:hashedPassword,
        mobileNumber,
        dateOfBirth,
        gender,
        aadharNumber
      };
  
      const userResult = await collection.insertOne(userDocument);
      console.log('User document inserted successfully:', userResult.insertedId);
  

      const slotCollection = db.collection('slotdetails');
  
      const slotDocument = {
        name: username,
        email,
        'dosage 1': 'no',
        'dosage 1 date': null,
        'dosage 2': 'no',
        'dosage 2 date': null
      };
  
      const slotResult = await slotCollection.insertOne(slotDocument);
      console.log('Slot document inserted successfully:', slotResult.insertedId);
  

      client.close();
      res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
      console.log(error);
      console.error('Error submitting the form:', error);
      if (error.code === 11000) {
 
        res.status(400).json({ error: 'Duplicate entry. Please provide a unique key value.' });
      } else {

        res.status(500).json({ error: 'Error submitting the form' });
      }
    }
  });
  
  app.get('/admin/dashboard' ,(req,res)=>{
        const isloggedin = req.session.login;
        if(isloggedin){
          res.sendFile(path.join(__dirname,'views/html/dashboard.html'));
        }else{
          res.redirect('/admin/login');
        }
  });
  app.post('/admin/dashboard', async (req, res) => {
    try {
      const { centreName, location, timeRange } = req.body;
  

      var { client, db, collection } = await connectToMongoDB('Vaccination', 'centre');
  

      const collectionExists = await db.listCollections({ name: 'centre' }).hasNext();
      if (!collectionExists) {

        await collection.createIndex({ centreName: 1 }, { unique: true });
      }
  
     
      const result = await collection.insertOne({ centreName, location, timeRange });
      client.close();
  
      var { client, db, collection } = await connectToMongoDB('Vaccination', 'availability');
      const result1 = await collection.insertOne({ 'Dosage Name': 'Dosage 1', 'Availability': 0, centreName: centreName });
      const result2 = await collection.insertOne({ 'Dosage Name': 'Dosage 2', 'Availability': 0, centreName: centreName });
  
    
      client.close();
  

      res.status(200).json({ message: 'Form data stored successfully' });
    } catch (error) {

      console.error(error);
      if (error.code === 11000) {
        res.status(400).json({ error: 'Centre name already exists' });
      } else {
        res.status(500).json({ error: 'Failed to store form data' });
      }
    }
  });
  
  
  app.get('/admin/centredetails', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'centre');
  
      const centerDetails = await collection.find({}).toArray();
      res.json(centerDetails);
      client.close(); 
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to fetch center details' });
    }
  });
  app.put('/admin/center', async (req, res) => {
     try {
      const { centreName, location, timeRange, updatedCentreName, updatedLocation, updatedTimeRange} = req.body;
  

      var { client, db, collection } = await connectToMongoDB('Vaccination','centre');
      console.log(req.body);

      var result = await  collection.updateOne({centreName,location,timeRange}, { $set: {centreName:updatedCentreName,location:updatedLocation,timeRange:updatedTimeRange } })
    
          if (result.modifiedCount === 1) {
            var { client, db, collection } = await connectToMongoDB('Vaccination', 'availability');
      
            var result = await  collection.updateMany({centreName}, { $set: {centreName:updatedCentreName} })
  
            console.log(result);
        
            res.sendStatus(200); 
          } else {
            res.status(404).json({ error: 'Center not found' });
          }
      
         
          client.close();
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      app.delete('/admin/center', async (req, res) => {
        try {
          const { centreName } = req.body;
          console.log(centreName);
        
          var { client, db, collection } = await connectToMongoDB('Vaccination', 'centre');
      
       
          var result = await collection.deleteOne({ centreName });
          console.log(result);
          if (result.deletedCount === 1) {
            var { client, db, collection } = await connectToMongoDB('Vaccination', 'availability');
      
    
            var result = await collection.deleteMany({ centreName });
            console.log(result);
        
            res.sendStatus(200); 
          } else {
            res.status(404).json({ error: 'Center not found' });
          }
      
          
          client.close();
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
  app.get('/admin/dosage',(req,res)=>{
    const isloggedin = req.session.login;
        if(isloggedin){
          console.log(req.session.centreName);
          res.sendFile(path.join(__dirname,'views/html/dosage.html'));
        }else{
          res.redirect('login');
        }
  })
  
  app.post('/admin/dosage', (req, res) => {
    req.session.centreName = req.body.centreName;
    console.log('dosage called successfully');
    res.sendStatus(200); 
  });  
  app.put('/admin/dosageavailability', async (req, res) => {
    try {
  
      const { dosageName, dosageAvailability } = req.body;
      const centreName = req.session.centreName;
  
     
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'availability');
      console.log('dosage availability called');
      
     
      const result = await collection.updateOne(
        { "centreName": centreName, "Dosage Name": dosageName },
        { $set: { "Availability": dosageAvailability } }
      );
      console.log(req.body);
  
    
      client.close();
  
      res.sendStatus(200);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  app.get('/admin/dosageavailability', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'availability');
   
      const dosageDetails = await collection.find({"centreName": req.session.centreName}).toArray();
  
   
      client.close();
  
     
      res.json(dosageDetails);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  app.get('/admin/login',(req,res)=>{
        res.sendFile(path.join(__dirname,'views/html/admin.html'));
  });
  app.post("/admin/login", async(req, res) => {
    const { adminid, password } = req.body;
  
    const { client, db, collection } = await connectToMongoDB('Vaccination','admin');
    const admin =  await collection.findOne({'adminid':req.body.adminid});
    console.log(admin);
    if(admin){
    if(req.body.password == admin.password ){

         req.session.adminid = req.body.adminid;
        req.session.login = true;
        res.status(200).json({ message: "Login Sucessful"});

    }else{
        res.status(401).json({error: "Invalid Password"});
    
      }
    }else{
      res.status(404).json({error: "Admin id not Found"});
    }
    client.close();
  });

  app.get('/public',(req,res)=>{
    try{
    if(req.session.public){
      res.sendFile(path.join(__dirname,'views/html/public.html'));
    }else{
      res.redirect('/');
    }
    }
    catch(e){
      res.redirect('/');
    }
  });
  app.put('/updatedosage', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'slotdetails');
  
    
      const { date, dosageName } = req.body;
  
    console.log(req.session.email);
      const update = {
        $set: {
          [dosageName.toLowerCase()]: 'yes',
          [`${dosageName.toLowerCase()} date`]: date
        }
      };
  
     
      const result = await collection.updateOne({'email':req.session.email}, update);
      console.log('Dosage details updated successfully:', result);
  

      client.close();
  
      
      res.status(200).json({ message: 'Dosage details updated successfully' });
    } catch (error) {
      console.error('Error updating dosage details:', error);

      res.status(500).json({ error: 'Error updating dosage details' });
    }
  });
  
  app.get('/getdosagedetails', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'slotdetails');
  
      const user = await collection.findOne({ email: req.session.email });
      if (user) {
        client.close();
        const response = [
          { dosagename: 'Dosage 1', date: user['dosage 1 date'] , vaccinated:user['dosage 1'] ,name:req.session.name,center:user['dosage 1 centre']},
          { dosagename: 'Dosage 2', date: user['dosage 2 date'] , vaccinated:user['dosage 2'] ,name:req.session.name,center:user['dosage 2 centre']}];
        res.status(200).json(response);
      } else {
        client.close();
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error getting dosage details:', error);

      res.status(500).json({ error: 'Error getting dosage details' });
    }
  });
  app.get('/getlocations', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'centre');
      const locations = await collection.find({}, { location: 1, _id: 0 }).toArray();
      client.close();
      
      const locationSet = new Set(locations.map(obj => obj.location)); 
       res.status(200).json(Array.from(locationSet));
    } catch (error) {
      console.error('Error getting locations:', error);
      res.status(500).json({ error: 'Error getting locations' });
    }
  });
  
  app.post('/getcenters', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'centre');
      const centers = await collection.find({ location: req.body.location }, { centreName: 1, _id: 0 }).toArray();
      const centreArray = centers.map(obj => obj.centreName);
      console.log(centers);
      client.close();
      res.status(200).json(centreArray);
    } catch (error) {
      console.error('Error getting centers:', error);
      res.status(500).json({ error: 'Error getting centers' });
    }
  });
  app.post('/checkavailability', async (req, res) => {
    try {
      const { client: availabilityClient, db: availabilityDB, collection: availabilityCollection } = await connectToMongoDB('Vaccination', 'availability');
      const { client: slotClient, db: slotDB, collection: slotCollection } = await connectToMongoDB('Vaccination', 'slotdetails');
  
      const dosageName = req.body.dosageName;
      const center = req.body.center;
  
      const totalAvailability = await availabilityCollection.find({ 'Dosage Name': dosageName, centreName: center }, { Availability: 1, _id: 0 }).toArray();
  
      const bookedSlots = await slotCollection.find({}).toArray();
  
      const currentDate = new Date();
      const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      let count = 0;
      for (const slot of bookedSlots) {
        if (slot[`${dosageName.toLowerCase()} date`] && new Date(slot[`${dosageName.toLowerCase()} date`]) >= today) {
          count++;
        }
      }
  
      const available = totalAvailability.length > 0 && (totalAvailability[0].Availability - count) > 0;
  

      const { client, db, collection } = await connectToMongoDB('Vaccination', 'centre');
      const centreName = center;
      const centerDocument = await collection.findOne({ centreName: centreName });
      const workingHours = centerDocument ? centerDocument.timeRange : null;
  
      availabilityClient.close();
      slotClient.close();
      client.close();
  
      res.json({ total: totalAvailability[0].Availability, count, available, workingHours });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  app.post('/bookslot', async (req, res) => {
    try {
      const { client: availabilityClient, db: availabilityDB, collection: availabilityCollection } = await connectToMongoDB('Vaccination', 'availability');
      const { client: slotClient, db: slotDB, collection: slotCollection } = await connectToMongoDB('Vaccination', 'slotdetails');
  
      const dosageName = req.body.dosageName;
      const center = req.body.center;
      console.log(dosageName);
      console.log(center);
  
      const totalDocument = await availabilityCollection.findOne({ 'Dosage Name': dosageName, centreName: center }, { Availability: 1, _id: 0 });
  
      if (!totalDocument || totalDocument.Availability === 0) {
        console.log(totalDocument);
        res.status(400).json({ error: 'No slots available' });
        return;
      }
  
      const newAvailability = totalDocument.Availability - 1;
      await availabilityCollection.updateOne({ 'Dosage Name': dosageName, centreName: center }, { $set: { Availability: newAvailability } });

      const currentUser = req.session.name;
      console.log(currentUser);
      const { client: checkClient, db: checkDB, collection: checkCollection } = await connectToMongoDB('Vaccination', 'slotdetails');
  
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate());
      const tomorrowDate = tomorrow.toISOString().split('T')[0];
  
    
      let currentDate = new Date(tomorrowDate);
      let slotsCount  = 0;
      let nextAvailableSlot = currentDate;
  
      do{
        currentDate.setDate(currentDate.getDate() + 1);
        const slotsDocuments = await checkCollection.find({
          $and: [
            { $or: [{ 'dosage 1 centre': center, 'dosage 1 date': currentDate }, { 'dosage 2 centre': center, 'dosage 2 date': currentDate}] },
            { $or: [{ 'dosage 1 date': { $exists: false } }, { 'dosage 2 date': { $exists: false } }] },
          ],
        }).toArray();
  
        slotsCount = slotsDocuments.length;
        nextAvailableSlot = currentDate;
        console.log(slotsCount);
        console.log(nextAvailableSlot);
      }while (slotsCount > 9);
      console.log(nextAvailableSlot);
      checkClient.close();
      nextAvailableSlot = nextAvailableSlot.toISOString().split('T')[0];
      if (dosageName === 'Dosage 1') {
        var result = await slotCollection.updateMany({ name: currentUser.trim() }, { $set: { 'dosage 1 centre': center, 'dosage 1 date': nextAvailableSlot ,'dosage 1':'yes' } });
        console.log(result);
      } else if (dosageName === 'Dosage 2') {
        var result = await slotCollection.updateMany({ name: currentUser.trim() }, { $set: { 'dosage 2 centre': center, 'dosage 2 date': nextAvailableSlot ,'dosage 2':'yes'} });
        console.log(result);
      }
      
      
      availabilityClient.close();
      slotClient.close();
  
      res.json({ message: 'Booking successful' });
    } catch (error) {
      console.log(error);
      console.error('Error booking slot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  app.post('/centerworkinghours', async (req, res) => {
    try {
      const { client, db, collection } = await connectToMongoDB('Vaccination', 'centre');
  
      const centreName = req.body.centreName;
  
    
      const center = await collection.findOne({ centreName: centreName });
  
     
      if (center) {
        const workingHours = center.timeRange;
        res.json({ workingHours });
      } else {
        res.status(404).json({ error: 'Center not found' });
      }
  
      client.close();
    } catch (error) {
      console.error('Error retrieving center working hours:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/publicbookeddetails', async (req, res) => {
    const { client, db, collection } = await connectToMongoDB('Vaccination', 'slotdetails');
    const centreName = req.session.centreName;
  
    try {
      const query = {
        $or: [
          { "dosage 1 centre": centreName },
          { "dosage 2 centre": centreName }
        ]
      };
  
      const data = await collection.find(query).toArray();
      const response = [];
  
     
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      data.forEach(entry => {
        const dosage1Date = new Date(entry["dosage 1 date"]);
        const dosage2Date = new Date(entry["dosage 2 date"]);
  
        if (
          (entry["dosage 1 centre"] === centreName && dosage1Date >= today) ||
          (entry["dosage 2 centre"] === centreName && dosage2Date >= today)
        ) {
          response.push({
            name: entry.name,
            dosageDate: dosage1Date >= today ? entry["dosage 1 date"] : entry["dosage 2 date"],
            dosageType: dosage1Date >= today ? "dosage 1" : "dosage 2"
          });
        }
      });
  
      res.json(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      client.close();
    }
  });
  

app.get('/clearsession', (req, res) => {
     req.session.name = '';
     req.session.email = '';
     req.session.public  = false;
     res.sendStatus(200);
});

app.get('/admin/clearsession', (req, res) => {
  req.session.adminid = '';
  req.session.login = false;
  res.sendStatus(200);
});
  
  const port = 3000; 

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });