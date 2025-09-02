const moment = require('moment');

// Booked and Reserved Lists
let bookedList = [
    { date: "2025-08-25", day: "Mon", slotId: "", start: "7:00", end: "7:45" }
];

let reservedList = [
    { date: "2025-08-25", day: "Mon", slotId: "", start: "8:00", end: "8:45" }
];

// Availability storage
let availability = [];

const serviceRules = [{

    serviceId: "20001",
    generationDurationType: "D",
    generationDuration: "45",
    serviceStartTime: "09:00",
    serviceDurationType: "F",
    serviceDuration: "30",
    serviceEndTime: "9:30",
    operatingDays: [
        { "day": "Mon", "start": "*", "end": "*" },
        { "day": "Wed", "start": "*", "end": "*" },
        { "day": "Fri", "start": "*", "end": "*" }
    ],
    serviceGapTimeType: "M",
    serviceGapTime: "10"

}]


//function to get the service details using service id
function getService(serviceId) {

    // this should be a get api which read the database for a service , which has the serviceid matching same as the parameter of getservice()
    return serviceRules[0];
}

//checks if the input date is today, tommorow or the future days
const checkDate = (inputDate) => {

    const today = moment().startOf("day");
    const givenDate = moment(inputDate).startOf("day");

    if (givenDate.isBefore(today)) return "past";
    if (givenDate.isSame(today)) return "today";
    return "future";
}

//function to generate a slot for using the service rule and inputdate.
function generateSlotsForService(serviceRules, inputDate) {

    // take the serviceRules.operatingDays, start & end time, duration , gap and service duration
    const operatingDays = serviceRules.operatingDays;
    const serviceStartTime = serviceRules.serviceStartTime;
    const serviceEndTime = serviceRules.serviceEndTime;
    const serviceDuration = serviceRules.serviceDuration;
    const generationDuration = serviceRules.generationDuration;
    console.log("inside the generateSlot for service");
    const status = checkDate(inputDate);

    if (status === "past") {

        throw new Error("Date is invalid. please choose today or a future date.")
    }
    let startDate = moment(inputDate, "YYYY-MM-DD").startOf("day");
    let endDate = moment(startDate).add(generationDuration, "days")

    // Loop through all days in the range
    for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, "day")) {
        const dayName = d.format("ddd");

        operatingDays.forEach(day => {
            const serviceDay = day.day;
            if (serviceDay.includes(dayName)) {
                // if (operatingDays.includes(dayName)) {
                console.log("get inside here");
                let slotStart = moment(d.format("YYYY-MM-DD") + " " + serviceStartTime, "YYYY-MM-DD HH:mm");
                let slotEnd = moment(d.format("YYYY-MM-DD") + " " + serviceEndTime, "YYYY-MM-DD HH:mm");

                let slotObj = {
                    slotId: `${d.format("YYYYMMDD")}-1`,
                    start: slotStart.format("HH:mm"),
                    end: slotEnd.format("HH:mm"),
                    status: "A"
                };
                // console.log("this is slotObj array" + slotObj);

                // check against booked/reserved
                if (bookedList.some(b => b.date === d.format("YYYY-MM-DD") && b.start === slotObj.start && b.end === slotObj.end)) {
                    slotObj.status = "B";
                } else if (reservedList.some(r => r.date === d.format("YYYY-MM-DD") && r.start === slotObj.start && r.end === slotObj.end)) {
                    slotObj.status = "R";
                }

                // Push into availability
                availability.push({
                    date: d.format("YYYY-MM-DD"),
                    day: dayName,
                    slots: [slotObj]
                });
            }
        });
    }
    // console.log("this is availability array" + availability);
    return availability;
}

// function to generate service availability
function generateServiceAvilability(serviceId, inputDate) {

    try {
        const status = checkDate(inputDate);
        if (status === "past") {
            throw new Error("Date is invalid. please choose today or a future date.")
        }
        // continue program if the input date is not on past
        let serviceRules = getService(serviceId);
        let Slots = generateSlotsForService(serviceRules, inputDate);
        console.log(JSON.stringify(Slots, null, 2));
    } catch (error) {

        console.log("Error Found::" + error);
    }
}

/// starting point (main function) of the program
generateServiceAvilability("20001", "2025-08-30");
