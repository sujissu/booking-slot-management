const moment = require("moment");

// ------------------- CORE SLOT LOGIC ------------------- \\
const checkDate = (inputDate) => {
    const today = moment().startOf("day");
    const givenDate = moment(inputDate).startOf("day");
    if (givenDate.isBefore(today)) return "past";
    if (givenDate.isSame(today)) return "today";
    return "future";
};

// ------------------- Fake DB Layer -------------------
function getService(serviceId) {
    // prototype version → returns hardcoded services
    const services = [
        {
            serviceId: "20001",
            generationDurationType: "F",
            generationDuration: 2,
            serviceStartTime: "22:00",
            serviceDurationType: "F",
            serviceDuration: 30,
            serviceEndTime: "3:00",
            operatingDays: [
                { day: "Mon", start: "*", end: "*" },
                { day: "Wed", start: "*", end: "*" },
                { day: "Fri", start: "*", end: "*" },
            ],
            serviceGapTimeType: "M",
            serviceGapTime: 10,
        },
        {
            serviceId: "20002",
            generationDurationType: "D",
            generationDuration: 7,
            serviceStartTime: "11:00",
            serviceDurationType: "F",
            serviceDuration: 60,
            serviceEndTime: "16:00",
            operatingDays: [

                { day: "Tue", start: "*", end: "*" },
                { day: "Thu", start: "*", end: "*" },
            ],
            serviceGapTimeType: "M",
            serviceGapTime: 15,
        },
    ];

    return services.find((s) => s.serviceId === serviceId);
}

// ------------------- Business Logic: 2 params ------------------- \\
function generateAvailability(serviceRules, inputDate) {

    // console.log("service" + JSON.stringify(serviceRules));
    if (!serviceRules) throw new Error("Service not found");

    // in real app, these come from DB → for now empty arrays
    const bookedList = [];
    const reservedList = [];

    const status = checkDate(inputDate);
    if (status === "past") throw new Error("Date is invalid. Please choose today or a future date.");

    let startDate = moment(inputDate, "YYYY-MM-DD").startOf("day");
    let endDate = moment(startDate).add(serviceRules.generationDuration, "days");

    let availability = [];

    for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, "day")) {
        
        const dayName = d.format("ddd");
        serviceRules.operatingDays.forEach((day) => {
            if (day.day === dayName) {

                let slotStart = moment(d.format("YYYY-MM-DD") + " " + serviceRules.serviceStartTime, "YYYY-MM-DD HH:mm");
                let serviceEnd = moment(d.format("YYYY-MM-DD") + " " + serviceRules.serviceEndTime, "YYYY-MM-DD HH:mm");

                // Handle cross-date (overnight shift)
                if (serviceEnd.isSameOrBefore(slotStart)) {
                    serviceEnd.add(1, "day");
                }

                let slotsForDay = [];
                let slotIndex = 1;

                while (slotStart.clone().add(serviceRules.serviceDuration, "minutes").isSameOrBefore(serviceEnd)) {
                    let slotEnd = slotStart.clone().add(serviceRules.serviceDuration, "minutes");

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

                    // slotStart = slotEnd.clone().add(serviceRules.serviceGapTime, "minutes");
                    // slotIndex++;

                    // DB would check reserved/booked — for now always free
                    if (bookedList.some((b) => b.date === d.format("YYYY-MM-DD") && b.start === slotObj.start && b.end === slotObj.end)) {

                        slotObj.status = "B";
                    } else if (reservedList.some((r) => r.date === d.format("YYYY-MM-DD") && r.start === slotObj.start && r.end === slotObj.end)) {

                        slotObj.status = "R";
                    }

                    slotsForDay.push(slotObj);
                    slotStart = slotEnd.clone().add(serviceRules.serviceGapTime, "minutes");
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

//  Service availability generator
function generateServiceAvailability(serviceId, inputDate) {

    try {
        const service = getService(serviceId);
        let Slots = generateAvailability(service, inputDate)

        if (Slots.length > 0) {

            let startDate = moment(inputDate, "YYYY-MM-DD").startOf("day");
            let endDate = moment(startDate).add(service.generationDuration, "days");

            //  Filter only days with at least one available slot
            let availableDays = Slots.filter(day =>
                day.slots.some(slot => slot.status === "A")
            );

            if (availableDays.length > 0) {

                console.log(
                    `Available ${service.generationDuration} days in between [[ start date ]]:${startDate.format(
                        "YYYY-MM-DD"
                    )} to [[ end date ]]:${endDate.format("YYYY-MM-DD")} are:::`
                );

                //  Print days + available slots
                availableDays.forEach(day => {

                    console.log(`${day.date} (${day.day}) :::`);
                    day.slots
                        .filter(slot => slot.status === "A")
                        .forEach(slot => {

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

generateServiceAvailability('20001', "2025-09-02")