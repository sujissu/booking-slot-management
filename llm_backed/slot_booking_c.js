const moment = require('moment');

// SAD: One booked conflict
// bookedList = [
//     { date: "2025-09-01", day: "Mon", slotId: "", start: "09:00", end: "09:30" }
// ];


// SAD: All booked
// bookedList = [];
// reservedList = [];
// // mark every slot as booked artificially
// for (let t = 9; t < 12; t++) {
//     bookedList.push({ date: "2025-09-01", day: "Mon", slotId: "", start: `${t}:00`, end: `${t}:30` });
// }


// Booked and Reserved Lists
let bookedList = [

    { date: "2025-08-25", day: "Mon", slotId: "", start: "07:00", end: "07:45" }
];

// SAD: Reserved conflict
// reservedList = [
    // { date: "2025-09-03", day: "Wed", slotId: "", start: "09:40", end: "10:10" }
// ];
let reservedList = [

    { date: "2025-08-25", day: "Mon", slotId: "", start: "08:00", end: "08:45" }
];

// Availability storage
let availability = [];

const serviceRules = {

    serviceId: "20001",
    generationDurationType: "D",
    generationDuration: 5,
    serviceStartTime: "09:00",
    serviceDurationType: "F",
    serviceDuration: 30,  // slot length
    serviceEndTime: "12:00",
    operatingDays: [
        { "day": "Mon", "start": "*", "end": "*" },
        { "day": "Wed", "start": "*", "end": "*" },
        { "day": "Fri", "start": "*", "end": "*" }
    ],
    serviceGapTimeType: "M",
    serviceGapTime: 10   // gap between slots
};

// Check date validity
const checkDate = (inputDate) => {

    const today = moment().startOf("day");
    const givenDate = moment(inputDate).startOf("day");
    if (givenDate.isBefore(today)) return "past";
    if (givenDate.isSame(today)) return "today";
    return "future";
};

//  Generate Slots For Service
function generateSlotsForService(service, inputDate) {

    const status = checkDate(inputDate);
    if (status === "past") throw new Error("Date is invalid. please choose today or a future date.");

    let startDate = moment(inputDate, "YYYY-MM-DD").startOf("day");
    console.log("start Date ::: " + new Date(startDate).toString()); 

    let endDate = moment(startDate).add(service.generationDuration, "days");
    console.log("end Date ::: " + new Date(endDate).toString());


    // Loop through all days in range
    for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, "day")) {

        const dayName = d.format("ddd");

        //loop through operating days (for eg: mon, tue, wed)
        service.operatingDays.forEach(day => {

            if (day.day === dayName) {

                let slotStart = moment(d.format("YYYY-MM-DD") + " " + service.serviceStartTime, "YYYY-MM-DD HH:mm");
                let serviceEnd = moment(d.format("YYYY-MM-DD") + " " + service.serviceEndTime, "YYYY-MM-DD HH:mm");
                let slotsForDay = [];
                let slotIndex = 1;

                // Loop until end time
                while (slotStart.clone().add(service.serviceDuration, "minutes").isSameOrBefore(serviceEnd)) {

                    let slotEnd = slotStart.clone().add(service.serviceDuration, "minutes");

                    let slotObj = {
                        slotId: `${d.format("YYYYMMDD")}-${slotIndex}`,
                        start: slotStart.format("HH:mm"),
                        end: slotEnd.format("HH:mm"),
                        status: "A"
                    };

                    // Check booked/reserved
                    if (bookedList.some(b => b.date === d.format("YYYY-MM-DD") && b.start === slotObj.start && b.end === slotObj.end)) {

                        slotObj.status = "B";
                    } else if (reservedList.some(r => r.date === d.format("YYYY-MM-DD") && r.start === slotObj.start && r.end === slotObj.end)) {

                        slotObj.status = "R";
                    }

                    slotsForDay.push(slotObj);

                    // Move to next slot (duration + gap)
                    slotStart = slotEnd.clone().add(service.serviceGapTime, "minutes");
                    slotIndex++;
                }

                // Save availability for the day
                availability.push({
                    date: d.format("YYYY-MM-DD"),
                    day: dayName,
                    slots: slotsForDay
                });
            }
        });
    }

    return availability;
}

//  Service availability generator
function generateServiceAvailability(serviceId, inputDate) {

    try {

        let service = getService(serviceId);
        let Slots = generateSlotsForService(service, inputDate);
        console.log(JSON.stringify(Slots, null, 2));
    } catch (error) {

        console.log("Error Found::" + error.message);
    }
}

// Dummy "getService"
function getService(serviceId) {

    return serviceRules; // picking first for now
}

//  Run
generateServiceAvailability("20001", "2025-09-01");


// HAPPY: No conflicts
// generateServiceAvailability("20001", "2025-09-01");

// SAD: Past date
// generateServiceAvailability("20001", "2025-08-01");

// SAD: One booked conflict
// generateServiceAvailability("20001", "2025-09-01");


// SAD: Reserved conflict
// generateServiceAvailability("20001", "2025-09-01");

// SAD: All booked
// generateServiceAvailability("20001", "2025-09-01");
