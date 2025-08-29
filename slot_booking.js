let availabilty=[

    {"date":"2025-08-25","day":"Mon","slots":[
        {"slotId":"","start":"","end":"","status":"A"}
    ]
    }
]

let bookedList = [

    {
        "date": "2025-08-25", "day": "Mon", "slotId": "", "start": "7:00", "end": "7:45"
    }
]

let reservedList = [

    {
        "date": "2025-08-25", "day": "Mon", "slotId": "", "start": "8:00", "end": "8:45"
    }
]

const  serviceRules= [{

        "serviceId": "20001",
        "generationDurationType": "D",
        "generationDuration": "45",
        "serviceStartTime": "09:00",
        "serviceDurationType": "F",
        "serviceDuration": "30",
        "serviceEndTime": "9:30",
        "operatingDays": [
            { "day": "Mon", "start": "*", "end": "*" },
            { "day": "Wed", "start": "*", "end": "*" },
            { "day": "Fri", "start": "*", "end": "*" }
        ], 
        "serviceGapTimeType": "M",
        "serviceGapTime": "10"

    }]
// let input = {
//     "serviceSlot": [
//         {
//             "serviceId": "20001",
//             "generationDurationType": "D",
//             "generationDuration": "45",
//             "serviceStartTime": "09:00",
//             "serviceDurationType": "F",
//             "serviceDuration": "30",
//             "serviceEndTime": "9:30",
//             "operatingDays": [
//                 { "day": "Mon", "start": "*", "end": "*" },
//                 { "day": "Wed", "start": "*", "end": "*" },
//                 { "day": "Fri", "start": "*", "end": "*" }
//             ],
//             "serviceGapTimeType": "M",
//             "serviceGapTime": "10"
//         },
//         {
//             "serviceId": "20002",
//             "generationDurationType": "H",
//             "generationDuration": "4",
//             "serviceStartTime": "7:00",
//             "serviceDurationType": "F",
//             "serviceDuration": "45",
//             "serviceEndTime": "18:00",
//             "operatingDays": [
//                 { "day": "Tue", "start": "*", "end": "*" },
//                 { "day": "Thu", "start": "*", "end": "*" }
//             ],
//             "serviceGapTimeType": "M",
//             "serviceGapTime": "15"
//         },
//         {

//             "serviceId": "20003",
//             "generationDurationType": "D",
//             "generationDuration": "60",
//             "serviceStartTime": "10:30",
//             "serviceDurationType": "F",
//             "serviceDuration": "90",
//             "serviceEndTime": "16:30",
//             "operatingDays": [
//                 { "day": "Mon", "start": "*", "end": "*" },
//                 { "day": "Tue", "start": "*", "end": "*" },
//                 { "day": "Wed", "start": "*", "end": "*" },
//                 { "day": "Thu", "start": "*", "end": "*" },
//                 { "day": "Fri", "start": "*", "end": "*" }
//             ],
//             "serviceGapTimeType": "M",
//             "serviceGapTime": "30"
//         }
//     ]
// }

// function slotGenerator(params) {
//     try {
//         if (isBooked() == true) {
//             // throw new Error("This slot has been booked!");
//             return console.log("This slot has been booked!");

//         } else if (isReserved() == true) {
//             // throw new Error("This slot has been reserved!");
//             return console.log("This slot has been reserved!");
//         } else {
//             const result = generateSlots(input.serviceSlot[0])
//             console.log("success:: your slot has been generated::" + result);
//         }
//     } catch (error) {
//         console.log("error while running the  function ::" + error.message);
//     }
// }

// const isBooked = (params) => {
//     return false;
// }
// const isReserved = (params) => {
//     return false;
// }
// const generateSlots = (slot) => {
//     return [`${slot.serviceStartTime}-${slot.serviceEndTime}`];
// }

// slotGenerator(input);

function getService(serviceId){
 // this should be a get api which read the database for a service , which has the serviceid matching same as the parameter of getservice()
 return serviceRules[0];
}

function generateSlot(serviceRules) {

}

function generateServiceAvilability(serviceId,inputDate){
   let serviceRules= getService(serviceId);
   console.log(serviceRules);
   let slot = generateSlot(serviceRules);
}

/// starting point
generateServiceAvilability("20001","2025-09-01")
