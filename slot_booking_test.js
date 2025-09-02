const moment = require("moment");

// ------------------- CORE SLOT LOGIC ------------------- \\

// Check date validity
const checkDate = (inputDate) => {
    const today = moment().startOf("day");
    const givenDate = moment(inputDate).startOf("day");
    if (givenDate.isBefore(today)) return "past";
    if (givenDate.isSame(today)) return "today";
    return "future";
};

// Generate Slots For Service
function generateSlotsForService(service, inputDate, bookedList, reservedList) {
    const status = checkDate(inputDate);
    if (status === "past") throw new Error("Date is invalid. Please choose today or a future date.");

    let startDate = moment(inputDate, "YYYY-MM-DD").startOf("day");
    let endDate = moment(startDate).add(service.generationDuration, "days");

    let availability = [];

    for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, "day")) {
        const dayName = d.format("ddd");

        service.operatingDays.forEach((day) => {
            if (day.day === dayName) {
                let slotStart = moment(d.format("YYYY-MM-DD") + " " + service.serviceStartTime, "YYYY-MM-DD HH:mm");
                let serviceEnd = moment(d.format("YYYY-MM-DD") + " " + service.serviceEndTime, "YYYY-MM-DD HH:mm");

                // Handle cross-date (overnight shift)
                if (serviceEnd.isSameOrBefore(slotStart)) {
                    serviceEnd.add(1, "day");
                }

                let slotsForDay = [];
                let slotIndex = 1;

                while (slotStart.clone().add(service.serviceDuration, "minutes").isSameOrBefore(serviceEnd)) {
                    let slotEnd = slotStart.clone().add(service.serviceDuration, "minutes");

                    let slotObj = {
                        slotId: `${d.format("YYYYMMDD")}-${slotIndex}`,
                        start: slotStart.format("HH:mm"),
                        end: slotEnd.format("HH:mm"),
                        status: "A",
                    };

                    // assign slot to the right date bucket
                    let slotDate = slotStart.format("YYYY-MM-DD");
                    let slotDay = slotStart.format("ddd");

                    let dayBucket = availability.find(a => a.date === slotDate);
                    if (!dayBucket) {
                        dayBucket = { date: slotDate, day: slotDay, slots: [] };
                        availability.push(dayBucket);
                    }
                    dayBucket.slots.push(slotObj);

                    // check booked/reserved
                    if (bookedList.some((b) => b.date === d.format("YYYY-MM-DD") && b.start === slotObj.start && b.end === slotObj.end)) {
                        slotObj.status = "B";
                    } else if (reservedList.some((r) => r.date === d.format("YYYY-MM-DD") && r.start === slotObj.start && r.end === slotObj.end)) {
                        slotObj.status = "R";
                    }

                    slotsForDay.push(slotObj);

                    // move to next slot
                    slotStart = slotEnd.clone().add(service.serviceGapTime, "minutes");
                    slotIndex++;
                }

                // availability.push({
                //     date: d.format("YYYY-MM-DD"),
                //     day: dayName,
                //     slots: slotsForDay,
                // });
            }
        });
    }
    return availability;
}

// Service availability generator (exportable, so test file can call it)
function generateServiceAvailability(service, inputDate, bookedList, reservedList, label) {
    console.log(`\n---- ${label} ----`);
    try {
        let Slots = generateSlotsForService(service, inputDate, bookedList, reservedList);

        if (Slots.length > 0) {
            let startDate = moment(inputDate, "YYYY-MM-DD").startOf("day");
            let endDate = moment(startDate).add(service.generationDuration, "days");

            // Filter only days with at least one available slot
            let availableDays = Slots.filter((day) => day.slots.some((slot) => slot.status === "A"));

            if (availableDays.length > 0) {
                console.log(
                    `Available ${service.generationDuration} days in between [[ start date ]]:${startDate.format(
                        "YYYY-MM-DD"
                    )} to [[ end date ]]:${endDate.format("YYYY-MM-DD")} are:::`
                );

                // Print days + available slots
                availableDays.forEach((day) => {
                    console.log(`${day.date} (${day.day}) :::`);
                    day.slots
                        .filter((slot) => slot.status === "A")
                        .forEach((slot) => {
                            console.log(
                                `   "slotId": "${slot.slotId}", "start": "${slot.start}", "end": "${slot.end}"`
                            );
                        });
                });
            } else {
                console.log("No available days are there in between start date and end date");
            }
        } else {
            console.log("No available days are there in between start date and end date");
        }
    } catch (error) {
        console.log("Error Found:: " + error.message);
    }
}

// ------------------- SERVICE RULE -------------------
const serviceRules = {
    serviceId: "20001",
    generationDurationType: "D",
    generationDuration: 5, // keep small for testing
    serviceStartTime: "09:00",
    serviceDurationType: "F",
    serviceDuration: 30, // slot length
    serviceEndTime: "12:00",
    operatingDays: [
        { day: "Mon", start: "*", end: "*" },
        { day: "Wed", start: "*", end: "*" },
        { day: "Fri", start: "*", end: "*" },
    ],
    serviceGapTimeType: "M",
    serviceGapTime: 10, // gap between slots
};

// ------------------- TEST RUNNER ------------------- \\

// HAPPY: no conflicts (all slots free)
generateServiceAvailability(serviceRules, "2025-09-02", [], [], "HAPPY: All slots free");

// SAD: past date
generateServiceAvailability(serviceRules, "2025-08-01", [], [], "SAD: Past date");

// SAD: one booked conflict
generateServiceAvailability(
    serviceRules,
    "2025-09-01",
    [{ date: "2025-09-02", day: "Mon", slotId: "", start: "09:00", end: "09:30" }],
    [],
    "SAD: One booked conflict"
);

// SAD: one reserved conflict
generateServiceAvailability(
    serviceRules,
    "2025-09-02",
    [],
    [{ date: "2025-09-01", day: "Mon", slotId: "", start: "09:40", end: "10:10" }],
    "SAD: One reserved conflict"
);

// SAD: all booked
let allBooked = [];
let slotTime = moment("2025-09-02 09:00", "YYYY-MM-DD HH:mm");
let endTime = moment("2025-09-02 12:00", "YYYY-MM-DD HH:mm");
while (slotTime.clone().add(30, "minutes").isSameOrBefore(endTime)) {
    let s = slotTime.format("HH:mm");
    let e = slotTime.clone().add(30, "minutes").format("HH:mm");
    allBooked.push({ date: "2025-09-02", day: "Mon", slotId: "", start: s, end: e });
    slotTime = slotTime.clone().add(40, "minutes"); // duration + gap
}
generateServiceAvailability(serviceRules, "2025-09-02", allBooked, [], "SAD: All booked");

// MIXED: some booked, some reserved, rest free
generateServiceAvailability(
    serviceRules,
    "2025-09-02",
    [{ date: "2025-09-02", day: "Mon", slotId: "", start: "09:00", end: "09:30" }],
    [{ date: "2025-09-02", day: "Mon", slotId: "", start: "10:20", end: "10:50" }],
    "MIXED: Some booked, some reserved, rest free"
);


// CROSS-DATE: overnight service (22:00 → 03:00 next day)
const crossDateService = {
    serviceId: "30001",
    generationDurationType: "D",
    generationDuration: 2,
    serviceStartTime: "22:00",
    serviceDurationType: "F",
    serviceDuration: 60, // 1-hour slots
    serviceEndTime: "03:00", // next day
    operatingDays: [
        { day: "Tue", start: "*", end: "*" },
        { day: "Thu", start: "*", end: "*" },
    ],
    serviceGapTimeType: "M",
    serviceGapTime: 15, // gap between slots
};

generateServiceAvailability(
    crossDateService,
    "2025-09-02", // a Tuesday
    [],
    [],
    "CROSS-DATE: Overnight service from 22:00 to 03:00 next day"
);

