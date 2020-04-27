const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firestore);
let db = admin.firestore();
let FieldValue = require('firebase-admin').firestore.FieldValue;
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.shipcargo = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
    } else {
        
        let data = {
            //shipperInfo
            shipperName: req.body.shipperName,
            shipperAddress: req.body.shipperAddress,
            shipperPhone: req.body.shipperPhone,
            shipperEmail: req.body.shipperEmail,
            //receiverInfo
            recieverName: req.body.recieverName,
            receiverAddress: req.body.receiverAddress,
            receiverPhone: req.body.receiverPhone,
            receiverEmail: req.body.receiverEmail,
            //shipmentinformation
            origin: req.body.origin,
            destination: req.body.destination,
            weight: req.body.weight,
            // product: req.body.product,
            totalFreight: req.body.totalFreight,
            pickupDate: req.body.pickupDate,
            comments: req.body.comments,
            package: req.body.package,
            carrier: req.body.carrier,
            // shipmentMode: req.body.shipmentMode,
            quantity: req.body.quantity,
            expectedDeliveryDate: req.body.eDeliveryDate,
            pickupTime: req.body.pickupTime,
            status: req.body.status,
            typeOfShipment: req.body.typeOfShipment,
            carrierReFNo: req.body.carrierReFNo,
            paymentMode: req.body.paymentMode,
            departureTime: req.body.departureTime,
            dateCreated : FieldValue.serverTimestamp()
        }
        console.log(data)

        var initialID = Math.random().toString().substr(2, 9);
        var id = initialID.toUpperCase()
        var shipmentID = 'GEX' + id
        console.log(shipmentID)

        let docRef = db.collection('shipment').doc(shipmentID)
        await docRef.set(data).then(() => {
            res.send({
                "status": 200,
                "message": "Shipment information submitted successfully"
            })
        }).catch(err => {
            console.log(err)
            res.send({
                "status": "207",
                "message": "Error submitting shipment information"
            })
        })

    }

})

exports.updateShipment = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
    } else {
        if (req.method !== 'POST') {
            res.status(403).end("Method Not Allowed");
        } else {
            let id = req.query.id;
            console.log(id);

            let docRef = db.collection('shipment').doc(id)
            await docRef.update({
                //shipmentinformation
                origin: req.body.origin,
                destination: req.body.destination,
                weight: req.body.weight,
                totalFreight: req.body.totalFreight,
                pickupDate: req.body.pickupDate,
                package: req.body.package,
                carrier: req.body.carrier,
                // shipmentMode: req.body.shipmentMode,
                quantity: req.body.quantity,
                expectedDeliveryDate: req.body.eDeliveryDate,
                pickupTime: req.body.pickupTime,
                typeOfShipment: req.body.typeOfShipment,
                carrierReFNo: req.body.carrierReFNo,
                paymentMode: req.body.paymentMode,
                departureTime: req.body.departureTime,
                comments: req.body.comments,
                status: req.body.status,

            }).then(function () {
                console.log('update succussful')

            }).catch(err => {
                console.log(err)
                res.send({
                    "status": 207,
                    "message": "Error updating data",
                    "error": err
                })
            })


            let shipmentHistoryData = {
                //shipment History
                date: req.body.date,
                time: req.body.time,
                location: req.body.location,
                status: req.body.status,
                remarks: req.body.comments,
                updatedBy: "Admin",
                dateCreated:FieldValue.serverTimestamp()
            }

            let subDocRef = db.collection('shipment').doc(id).collection('shipmentHistory')
            subDocRef.add(shipmentHistoryData).then(ref => {
                console.log('shipment history data saved successfully with id', ref.id)
                res.send({
                    "status": 200,
                    "message": "data updated and shipment history added successfully"
                })
            }).catch(err => {
                console.log(err)
                res.send({
                    "status": 207,
                    "message": "Error adding shipment history",
                    "error": err.toString()
                })
            })
        }
    }



})

//get shipment details by id
exports.getShipmentDetails = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
    } else {
        if (req.method !== 'GET') {
            res.status(403).end("Method Not Allowed");
        } else {

            let id = req.query.id
            let shipmentData
            console.log(id)

            let shipRef = db.collection('shipment').doc(id)
            await shipRef.get().then(doc => {
                if (!doc.exists) {
                    console.log('no such document')
                    res.send({
                        "status":207,
                        "message": "no such document"
                    })
                } else {
                    console.log('Document Data :', doc.data())
                    shipmentData = doc.data();

                }
            }).catch(err => {
                console.log('Error getting document', err);
                res.send({
                    "status": 207,
                    "message": "error getting shipment document"
                })
            })

            let sfRef = db.collection('shipment').doc(id).collection('shipmentHistory').orderBy('dateCreated', 'desc')
            sfRef.get().then(snapshot => {
                const documents = [];
                //go through each document data
                snapshot.forEach(doc => {
                    //include id to each documents
                    documents.push({
                        id: doc.id,
                        ...doc.data()
                    })
                    console.log(doc.id, '=>', doc.data());
                })

                res.send({
                    'data': {
                        shipmentData,
                        "shipmentHistory": documents
                    }
                })
            }).catch(err => {
                console.log(err);
                res.send({
                    "status": 200,
                    "message": "Error getting shipment history data"
                })
            })
        }

    }





})

//cloud firestore function to get all data from shipment collection
exports.getAllShipments = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
    } else {
        if (req.method !== 'GET') {
            res.status(405).end("Method Not Allowed");
        } else {
            let docRef = db.collection('shipment').orderBy('dateCreated', 'desc')
            let getAllDoc = docRef.get().then(snapshot => {
                const documents = [];
                //go through each document data
                snapshot.forEach(doc => {
                    //include id to each documents
                    documents.push({
                        id: doc.id,
                        ...doc.data()
                    })
                    console.log(doc.id, '=>', doc.data());
                })
                res.send({
                    "status": 200,
                    "data": documents
                })
            }).catch(err => {
                console.log("error fetching data", err)
                res.send({
                    "status": 400,
                    "message": "Error fetching data"
                })
            })
        }
    }
})

// get shippment history details by id
// exports.getShipmentHistoryDetails = functions.https.onRequest(async (req, res) => {
//     let id = req.params.id

//     let shipRef = db.collection('shipment').where('shipmentid', '==', id);
//     let getDoc = shipRef.get().then(doc => {
//         if (!doc.exists) {
//             console.log('no such document')
//         } else {
//             console.log('Document Data :', doc.data())
//             res.send({
//                 "data": doc.data()
//             })
//         }
//     }).catch(err => {
//         console.log('Error getting document', err);
//     })
// }