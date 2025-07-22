import React, { useState } from "react";

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
  const [sender, setSender] = useState("VF-Cash");
  const [body, setBody] = useState("");
  const [datetime, setDatetime] = useState("");
  const [status, setStatus] = useState("pending");

  // لإضافة رسالة جديدة
  const addMessage = (e) => {
    e.preventDefault();
    if (!body || !datetime) return;
    setMessages([
      ...messages,
      { sender, body, datetime, status }
    ]);
    setBody("");
    setDatetime("");
    setStatus("pending");
  };

  return (
    <div style={{fontFamily: "Arial, sans-serif", background: "#f7f7f7", minHeight: "100vh", padding: "20px"}}>
      <h1 style={{textAlign: "center", marginBottom: 20}}>📬 لوحة تحكم رسائل فودافون كاش</h1>
      {/* فورم لإضافة رسالة */}
      <form onSubmit={addMessage} style={{marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center"}}>
        <input
          type="text"
          placeholder="محتوى الرسالة"
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{padding: 8, minWidth: 250}}
          required
        />
        <input
          type="datetime-local"
          value={datetime}
          onChange={e => setDatetime(e.target.value)}
          style={{padding: 8}}
          required
        />
        <select value={status} onChange={e => setStatus(e.target.value)} style={{padding: 8}}>
          <option value="pending">لم تصل ⏳</option>
          <option value="delivered">وصلت ✅</option>
        </select>
        <button type="submit" style={{padding: "8px 18px", background: "#111", color: "#fff", border: "none", borderRadius: 4}}>إضافة</button>
      </form>
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
              <th style={thStyle}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td style={tdStyle} colSpan={8}>لا توجد رسائل بعد</td>
              </tr>
            ) : messages.map((msg, idx) => {
              const details = extractDetails(msg.body);
              return (
                <tr key={idx}>
                  <td style={tdStyle}>{msg.sender}</td>
                  <td style={tdStyle}>{msg.body}</td>
                  <td style={tdStyle}>{details.number}</td>
                  <td style={tdStyle}>{details.amount} جنيه</td>
                  <td style={tdStyle}>{details.operation}</td>
                  <td style={tdStyle}>{details.balance} جنيه</td>
                  <td style={tdStyle}>{msg.datetime.replace("T", " ")}</td>
                  <td style={{...tdStyle, color: msg.status === 'delivered' ? 'green' : 'orange', fontWeight: 'bold'}}>
                    {msg.status === 'delivered' ? 'وصلت ✅' : 'لم تصل ⏳'}
                  </td>
                </tr>
              );
            })}
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
