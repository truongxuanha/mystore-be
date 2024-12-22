const mysql = require("../../config/mysql_db");

const Revenue = function () {};

// Function to get revenue for the specified month
Revenue.getRevenueMonth = function (startDate, endDate, result) {
  const query = `
  WITH RECURSIVE DateRange AS (
      SELECT ? AS date
      UNION ALL
      SELECT DATE_ADD(date, INTERVAL 1 DAY)
      FROM DateRange
      WHERE date < ?
  )
    SELECT d.date, IFNULL(SUM(b.total_amount_order), 0) AS total
    FROM DateRange d
    LEFT JOIN \`bill\` AS b ON DATE(b.confirmAt) = d.date
    GROUP BY d.date
    ORDER BY d.date;
`;

  mysql.query(query, [startDate, endDate], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      const formattedData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit"
        }),
        total: item.total
      }));
      result({ status: true, data: formattedData });
    }
  });
};
Revenue.getStatistical = (result) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM products) AS total_products,
      (SELECT COUNT(*) FROM bill WHERE status = 0) AS total_pending_orders,
      (SELECT COUNT(*) FROM account WHERE account.permission = 1) AS total_customers,
      (SELECT COALESCE(SUM(total_amount_order), 0) 
       FROM bill 
       WHERE MONTH(confirmAt) = MONTH(CURRENT_DATE()) AND YEAR(confirmAt) = YEAR(CURRENT_DATE())
      ) AS total_monthly_revenue
  `;
  mysql.query(query, function (err, data) {
    if (err) {
      result({ status: false, data: err });
      return;
    }
    result({ status: true, data: data[0] });
  });
};
Revenue.getRecentOrders = (result) => {
  const query = `
    SELECT 
      bill.id, 
      bill.id_account, 
      acc.account_name, -- Lấy tên tài khoản
      bill.total_amount_order, 
      bill.status, 
      bill.confirmAt
    FROM 
      bill
    LEFT JOIN 
      account acc ON acc.id = bill.id_account
    ORDER BY 
      bill.confirmAt DESC
    LIMIT 5;
  `;

  mysql.query(query, function (err, data) {
    if (err) {
      result({ status: false, data: err });
      return;
    }

    const formattedData = data.map((order) => ({
      id: order.id,
      id_account: order.id_account,
      account_name: order.account_name || "Unknown", // Nếu không có account_name, đặt là "Unknown"
      total_amount_order: order.total_amount_order,
      status: order.status,
      confirmAt: order.confirmAt
        ? new Date(order.confirmAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })
        : null // Nếu confirmAt là null, trả về null
    }));

    result({ status: true, data: formattedData });
  });
};

module.exports = Revenue;
