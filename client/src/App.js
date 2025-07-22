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

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://sms-api-gnxl.onrender.com/api/messages")
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{fontFamily: "Arial, sans-serif", background: "#f7f7f7", minHeight: "100vh", padding: "20px"}}>
      <h1 style={{textAlign: "center", marginBottom: 20}}>📬 لوحة تحكم رسائل فودافون كاش</h1>
      <div style={{overflowX: "auto"}}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white"
        }}>
          <thead>
            <tr>
              <th style={thStyle}>المرسل</th>
              <th style={thStyle}>محتوى الرسالة</th>
              <th style={thStyle}>الرقم المحوِّل</th>
              <th style={thStyle}>المبلغ</th>
              <th style={thStyle}>رقم العملية</th>
              <th style={thStyle}>الرصيد المتبقي</th>
              <th style={thStyle}>الوقت</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={tdStyle}>جاري التحميل...</td></tr>
            ) : messages.length === 0 ? (
              <tr><td colSpan={7} style={tdStyle}>لا توجد رسائل بعد</td></tr>
            ) : (
              messages.map((msg, idx) => {
                const details = extractDetails(msg.message);
                return (
                  <tr key={idx}>
                    <td style={tdStyle}>{msg.sender}</td>
                    <td style={tdStyle}>{msg.message}</td>
                    <td style={tdStyle}>{details.number}</td>
                    <td style={tdStyle}>{details.amount} جنيه</td>
                    <td style={tdStyle}>{details.operation}</td>
                    <td style={tdStyle}>{details.balance} جنيه</td>
                    <td style={tdStyle}>{msg.datetime ? msg.datetime.replace("T", " ") : ""}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  background: "#111",
  color: "white",
  textAlign: "center"
};
const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center"
};

export default App;
