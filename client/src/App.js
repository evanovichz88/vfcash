import React, { useEffect, useState, useRef } from "react";

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

const API_URL = "https://sms-api-gnxl.onrender.com/api/messages";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef();

  // Get messages from API
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMessages(data.reverse()); // عشان الأحدث يظهر فوق
    } catch (err) {
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 60000); // auto-refresh كل دقيقة
    return () => clearInterval(intervalRef.current);
  }, []);

  // Delete message
  const handleDelete = async id => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف الرسالة؟")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchMessages();
  };

  // Filter messages
  const filtered = messages.filter(msg => {
    const details = extractDetails(msg.message || "");
    const row =
      msg.sender +
      msg.message +
      details.number +
      details.amount +
      details.operation +
      details.balance +
      (msg.datetime || "");
    return row.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📬 لوحة تحكم رسائل الخاصه بالكاش</h1>

      <input
        type="text"
        placeholder="ابحث عن رقم، مبلغ، وقت أو كلمة..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginBottom: 16,
          padding: 8,
          width: "100%",
          maxWidth: 400,
          fontSize: 16,
          display: "block",
          marginRight: "auto",
          marginLeft: "auto"
        }}
      />

      {loading ? (
        <div style={{ textAlign: "center" }}>...جارى التحميل</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white"
          }}
        >
          <thead>
            <tr>
              <th>حذف</th>
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
            {filtered.map((msg, idx) => {
              const details = extractDetails(msg.message || "");
              return (
                <tr key={msg._id || idx}>
                  <td>
                    <button
                      style={{
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        cursor: "pointer"
                      }}
                      onClick={() => handleDelete(msg._id)}
                    >
                      حذف
                    </button>
                  </td>
                  <td>{msg.sender}</td>
                  <td>{msg.message}</td>
                  <td>{details.number}</td>
                  <td>{details.amount} جنيه</td>
                  <td>{details.operation}</td>
                  <td>{details.balance} جنيه</td>
                  <td>
                    {(msg.datetime || "")
                      .replace("T", " ")
                      .replace(/:\d\d(\.\d+)?Z?$/, "")}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  لا يوجد نتائج
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
