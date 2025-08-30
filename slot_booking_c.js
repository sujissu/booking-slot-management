const moment = require("moment");

// Booked and Reserved Lists
let bookedList = [
    { date: "2025-08-25", start: "07:00", end: "07:45" }
];

let reservedList = [
    { date: "2025-08-25", start: "08:00", end: "08:45" }
];

// Availability storage
let availability = [];

// Service rules
const serviceRules = {
    serviceId: "20001",
    generationDurationType: "D",
    generationDuration: 10, // 45 days
    serviceStartTime: "09:00",
    serviceEndTime: "09:30",
    serviceDuration: 30, // minutes
    serviceGapTime: 10,  // minutes (not used here because start=end is fixed)
    operatingDays: ["Mon", "Wed", "Fri"]
};

//  Check if input date is valid
function checkDate(inputDate) {
    const today = moment().startOf("day");
    const givenDate = moment(inputDate).startOf("day");

    if (givenDate.isBefore(today)) return "past";
    if (givenDate.isSame(today)) return "today";
    return "future";
}

//  Generate Slots
function generateSlotsForService(service, inputDate) {
    const status = checkDate(inputDate);
    if (status === "past") {
        throw new Error("Date is invalid. Please choose today or a future date.");
    }

    let startDate = moment(inputDate, "YYYY-MM-DD").startOf("day");
    let endDate = moment(startDate).add(service.generationDuration, "days");

    // Loop through all days in the range
    for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, "day")) {
        let dayName = d.format("ddd"); // Mon, Tue, etc.

        if (service.operatingDays.includes(dayName)) {
            let slotStart = moment(d.format("YYYY-MM-DD") + " " + service.serviceStartTime, "YYYY-MM-DD HH:mm");
            let slotEnd = moment(d.format("YYYY-MM-DD") + " " + service.serviceEndTime, "YYYY-MM-DD HH:mm");

            let slotObj = {
                slotId: `${d.format("YYYYMMDD")}-1`,
                start: slotStart.format("HH:mm"),
                end: slotEnd.format("HH:mm"),
                status: "A"
            };

            // Check against booked/reserved
            if (bookedList.some(b => b.date === d.format("YYYY-MM-DD") && b.start === slotObj.start && b.end === slotObj.end)) {
                slotObj.status = "B"; // Booked
            } else if (reservedList.some(r => r.date === d.format("YYYY-MM-DD") && r.start === slotObj.start && r.end === slotObj.end)) {
                slotObj.status = "R"; // Reserved
            }

            // Push into availability
            availability.push({
                date: d.format("YYYY-MM-DD"),
                day: dayName,
                slots: [slotObj]
            });
        }
    }

    return availability;
}

//  Run 
try {
    let result = generateSlotsForService(serviceRules, "2025-08-30");
    console.log(JSON.stringify(result, null, 2));
} catch (err) {
    console.log("Error:", err.message);
}
