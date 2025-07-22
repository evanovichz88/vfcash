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

const API_URL = "https://sms-api-gnxl.onrender.com/api/messages";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // جلب الرسائل مع أوتو ريفريش كل 15 ثانية
  useEffect(() => {
    let timer;
    const fetchMessages = () => {
      setLoading(true);
      fetch(API_URL)
        .then(res => res.json())
        .then(data => setMessages(data.reverse())) // الأحدث فوق
        .finally(() => setLoading(false));
    };
    fetchMessages();
    timer = setInterval(fetchMessages, 15000);
    return () => clearInterval(timer);
  }, []);

  // بحث متنوع
  const filtered = messages.filter(msg => {
    const details = extractDetails(msg.message || "");
    const row = [
      msg.sender,
      msg.message,
      details.number,
      details.amount,
      details.operation,
      details.balance,
      msg.datetime
    ].join(" ");
    return row.toLowerCase().includes(search.toLowerCase());
  });

  // حذف رسالة
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف الرسالة؟")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setMessages(msgs => msgs.filter(m => m._id !== id));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📬 لوحة تحكم رسائل فودافون كاش</h1>
      <input
        type="text"
        placeholder="ابحث عن رقم، مبلغ، وقت أو كلمة..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginBottom: 16,
          padding: 8,
          width: "100%",
          fontSize: 18,
          direction: "rtl"
        }}
      />
      {loading && <p style={{ textAlign: "center" }}>جاري التحميل...</p>}
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white"
      }}>
        <thead>
          <tr>
            <th>حذف</th>
            <th>المرسل</th>
            <th>محتوى الرسالة</th>
            <th>الرقم المحول</th>
            <th>المبلغ</th>
            <th>رقم العملية</th>
            <th>الرصيد المتبقي</th>
            <th>الوقت</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", color: "#999" }}>
                لا توجد رسائل مطابقة للبحث.
              </td>
            </tr>
          )}
          {filtered.map((msg, idx) => {
            const details = extractDetails(msg.message || "");
            return (
              <tr key={msg._id || idx}>
                <td>
                  <button
                    onClick={() => handleDelete(msg._id)}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      padding: "4px 10px",
                      fontWeight: "bold"
                    }}
                  >
                    حذف
                  </button>
                </td>
                <td>{msg.sender}</td>
                <td style={{ maxWidth: 320, wordBreak: "break-word" }}>{msg.message}</td>
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
