import React, { useEffect, useState } from "react";

// استخلاص تفاصيل الرسالة
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

  // جلب البيانات مع أوتو ريفريش
  useEffect(() => {
    const fetchData = () => {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(() => setMessages([]));
    };
    fetchData(); // أول تحميل
    const interval = setInterval(fetchData, 3000); // كل 15 ثانية
    return () => clearInterval(interval);
  }, []);

  // حذف رسالة (لو API بيدعم DELETE)
  const handleDelete = idx => {
    // هنبعت body فيه رقم الرسالة أو أي id لو متاح
    fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: idx })
    })
      .then(res => res.json())
      .then(() => {
        setMessages(msgs => msgs.filter((_, i) => i !== idx));
      });
  };

  // فلترة حسب البحث (أي عمود)
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

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📬 لوحة تحكم رسائل فودافون كاش</h1>

      <input
        type="text"
        placeholder="🔍 ابحث عن رقم، مبلغ، وقت أو كلمة..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginBottom: 16,
          padding: 8,
          width: "50%",
          fontSize: 16,
          border: "1px solid #aaa",
          borderRadius: 8
        }}
      />

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
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>
                لا توجد رسائل مطابقة للبحث
              </td>
            </tr>
          ) : filtered.map((msg, idx) => {
            // لازم idx يبقى من الرسائل الأصليه عشان الحذف يشتغل صح
            const realIdx = messages.indexOf(msg);
            const details = extractDetails(msg.message || "");
            return (
              <tr key={realIdx}>
                <td>{msg.sender}</td>
                <td>{msg.message}</td>
                <td>{details.number}</td>
                <td>{details.amount} جنيه</td>
                <td>{details.operation}</td>
                <td>{details.balance} جنيه</td>
                <td>{msg.datetime?.replace("T", " ").replace(/:\d\d\.\d+Z?$/, "")}</td>
                <td>
                  <button
                    onClick={() => handleDelete(realIdx)}
                    style={{
                      color: "white",
                      background: "#d9534f",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 14px",
                      cursor: "pointer"
                    }}>
                    حذف
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 14, color: "#888" }}>
        سيتم تحديث الجدول تلقائيًا كل 15 ثانية
      </div>
    </div>
  );
};

export default App;
