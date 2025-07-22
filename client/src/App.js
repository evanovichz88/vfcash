import React, { useEffect, useState } from "react";

function extractDetails(body) {
  const numberMatch = body.match(/من رقم (\d{11})/);
  const amountMatch = body.match(/مبلغ ([\d.]+) جنيه/);
  const balanceMatch = body.match(/رصيدك الحالي ([\d.]+) جنيه/);
  const opMatch = body.match(/رقم العملية (\d+)/);
  return {
    number: numberMatch ? numberMatch[1] : "غير موجود",
    amount: amountMatch ? amountMatch[1] : "غير معروف",
    balance: balanceMatch ? balanceMatch[1] : "غير معروف",
    operation: opMatch ? opMatch[1] : "غير معروف"
  };
}

const App = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch("https://sms-api-gnxl.onrender.com/api/messages")

      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(() => setMessages([]));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📬 لوحة تحكم رسائل فودافون كاش</h1>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white"
      }}>
        <thead>
          <tr>
            <th>المرسل</th>
            <th>محتوى الرسالة</th>
            <th>الرقم المحوِّل</th>
            <th>المبلغ</th>
            <th>رقم العملية</th>
            <th>الرصيد المتبقي</th>
            <th>الوقت</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg, idx) => {
            const details = extractDetails(msg.message || "");
            return (
              <tr key={idx}>
                <td>{msg.sender}</td>
                <td>{msg.message}</td>
                <td>{details.number}</td>
                <td>{details.amount} جنيه</td>
                <td>{details.operation}</td>
                <td>{details.balance} جنيه</td>
                <td>{msg.datetime?.replace("T", " ").replace(/:\d\d\.\d+Z?$/, "")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default App;
