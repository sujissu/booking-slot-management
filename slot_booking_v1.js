const moment = require('moment');

let availabilty = [

    {
        "date": "2025-08-25", "day": "Mon", "slots": [
            { "slotId": "", "start": "", "end": "", "status": "A" }
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

const serviceRules = [{

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

//function to get the service details using service id
function getService(serviceId) {
    // this should be a get api which read the database for a service , which has the serviceid matching same as the parameter of getservice()
    return serviceRules[0];
}

//checks if the input date is today, tommorow or the future days
const checkDate = (inputDate) => {
    const today = moment().startOf("day");
    const givenDate = moment(inputDate).startOf("day")

    if (givenDate.isBefore(today)) {
        return "past";
    } else if (givenDate.isSame(today)) {
        return "today";
    } else if (givenDate.isAfter(today)) {
        return "future";
    }
}

//function to generate a slot for using the service rule and inputdate.
function generateSlot(serviceRules, inputDate) {
    // take the serviceRules.operatingDays, start & end time, duration , gap and service duration
    const operatingDays = serviceRules.operatingDays;
    const serviceStartTime = serviceRules.serviceStartTime;
    const serviceEndTime = serviceRules.serviceEndTime;
    const serviceDuration = serviceRules.serviceDuration;
    const generationDuration = serviceRules.generationDuration;

    const checkedDate = checkDate(inputDate)
    // iterate through the operating days array

    operatingDays.forEach(element => {
        console.log(element.day);
    });

    console.log(" the input date is on ::" + checkedDate);
    // loop through it,  
}

// function to generate service availability
function generateServiceAvilability(serviceId, inputDate) {

    try {
        // function for checking inputDate is on past or not
        const checkedDate = checkDate(inputDate)

        // first check if the date is on past or not, stop the program if the input date is on past
        if (checkedDate === "past") {

            throw new Error("not a valid date")
        } else {

            // continue program if the input date is not on past
            let serviceRules = getService(serviceId);
            let slot = generateSlot(serviceRules, inputDate);
        }

    } catch (error) {
        console.log("Error Found::" + error);
    }

}

/// starting point (main function) of the program
generateServiceAvilability("20001", "2025-08-30");
