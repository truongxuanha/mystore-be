const mysql = require("../../config/mysql_db");

const Revenue = function() {};

// Function to get revenue for the specified month
Revenue.getRevenueMonth = function(startDate, endDate, result) {
    const query = `
    WITH RECURSIVE DateRange AS (
        SELECT ? AS date
        UNION ALL
        SELECT DATE_ADD(date, INTERVAL 1 DAY)
        FROM DateRange
        WHERE date < ?
    )
    SELECT d.date, IFNULL(SUM(p.quantity * p.price), 0) AS total
    FROM DateRange d
    LEFT JOIN \`bill\` AS b ON DATE(b.paymentAt) = d.date
    LEFT JOIN \`detail_bill\` AS db ON b.id = db.id_bill
    LEFT JOIN \`products\` AS p ON p.id = db.id_product
    GROUP BY d.date
    ORDER BY d.date;
`;

    mysql.query(query, [startDate, endDate], function(err, data) {
        if (err) {
            result({ status: false, data: err });
        } else {
            const formattedData = data.map((item) => ({
                date: new Date(item.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                }),
                total: item.total,
            }));
            result({ status: true, data: formattedData });
        }
    });
};

module.exports = Revenue;