import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// --- Component Imports for Charting ---
import { Pie, Bar } from 'react-chartjs-2';

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('recommend');

  return (
    <HashRouter>
      <div style={styles.appContainer}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 7L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 4.5L7 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={styles.logoText}>FurnishAI</span>
          </div>
          <nav>
            <Link to="/" style={activeTab === 'recommend' ? styles.navLinkActive : styles.navLink} onClick={() => setActiveTab('recommend')}>Recommend</Link>
            <Link to="/analytics" style={activeTab === 'analytics' ? styles.navLinkActive : styles.navLink} onClick={() => setActiveTab('analytics')}>Analytics</Link>
            <Link to="/info" style={activeTab === 'info' ? styles.navLinkActive : styles.navLink} onClick={() => setActiveTab('info')}>Info</Link>
          </nav>
        </header>

        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<RecommendPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/info" element={<InfoPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

// --- Page Components ---

function RecommendPage() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm FurnishAI. Describe the kind of furniture you're looking for, and I'll find some recommendations for you.", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/rag-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue, session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        text: data.generated_description,
        products: data.retrieved_products,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to get recommendation:", error);
      const errorMessage = { text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messageList}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
            <div style={{...styles.messageContent, backgroundColor: msg.sender === 'user' ? '#007aff' : '#e5e5ea', color: msg.sender === 'user' ? 'white' : 'black'}}>
              <p style={{margin: 0}}>{msg.text}</p>
            </div>
            {msg.sender === 'bot' && msg.products && (
              <div style={styles.productCarousel}>
                {msg.products.map(p => (
                  <div key={p.uniq_id} style={styles.productCard}>
                    <img src={p.primary_image || 'https://placehold.co/200x200/e5e5ea/333?text=No+Image'} alt={p.title} style={styles.productImage} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/e5e5ea/333?text=No+Image'; }} />
                    <div style={styles.productInfo}>
                      <p style={styles.productTitle}>{p.title}</p>
                      <p style={styles.productPrice}>{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
           <div style={styles.botMessage}>
             <div style={{...styles.messageContent, backgroundColor: '#e5e5ea', color: 'black'}}>
               <div style={styles.typingIndicator}>
                  <span></span><span></span><span></span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g., a modern wooden coffee table"
          style={styles.inputField}
          disabled={isLoading}
        />
        <button type="submit" style={styles.sendButton} disabled={isLoading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

function AnalyticsPage() {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/analytics');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                const prices = data
                  .map(item => {
                      if (!item.price || typeof item.price !== 'string') return null;
                      const cleanedPrice = item.price.replace(/[$,]/g, '');
                      const numericPrice = parseFloat(cleanedPrice);
                      return isNaN(numericPrice) ? null : numericPrice;
                  })
                  .filter(price => price !== null && price < 1000); 

                const priceBins = [0, 50, 100, 200, 500, 1000];
                const priceCounts = priceBins.map((bin, i) => {
                    const nextBin = priceBins[i + 1] || Infinity;
                    return prices.filter(p => p >= bin && p < nextBin).length;
                });
                const priceLabels = priceBins.slice(0, -1).map((bin, i) => `$${bin} - $${priceBins[i+1]}`);

                const categoryCounts = {};
                data.forEach(item => {
                    let categories = [];
                    try {
                        categories = Array.isArray(item.categories) ? item.categories : JSON.parse(item.categories.replace(/'/g, '"'));
                    } catch (e) {
                        // Ignore if parsing fails
                    }
                    if (Array.isArray(categories)) {
                       categories.forEach(cat => {
                           categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                       });
                    }
                });

                const sortedCategories = Object.entries(categoryCounts).sort(([,a],[,b]) => b-a).slice(0, 10);
                const categoryLabels = sortedCategories.map(([cat]) => cat);
                const categoryValues = sortedCategories.map(([,count]) => count);
                
                setChartData({
                    priceData: {
                        labels: priceLabels,
                        datasets: [{
                            label: 'Number of Products',
                            data: priceCounts,
                            backgroundColor: 'rgba(0, 122, 255, 0.6)',
                            borderColor: 'rgba(0, 122, 255, 1)',
                            borderWidth: 1,
                        }],
                    },
                    categoryData: {
                        labels: categoryLabels,
                        datasets: [{
                            label: 'Product Count',
                            data: categoryValues,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)',
                                'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                                'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)',
                                'rgba(100, 255, 100, 0.6)', 'rgba(255, 100, 100, 0.6)'
                            ],
                        }],
                    },
                });

            } catch (e) {
                console.error("Failed to fetch analytics data:", e);
                setError("Could not load analytics data. Please ensure the backend server is running.");
            }
        };
        fetchData();
    }, []);

    if (error) {
        return <div style={styles.chartContainer}><p>{error}</p></div>;
    }

    if (!chartData) {
        return <div style={styles.chartContainer}><p>Loading analytics...</p></div>;
    }

    // --- FIX STARTS HERE: Added detailed options for the Bar chart ---
    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Price Range ($)',
                    font: {
                        size: 14,
                        weight: 'bold',
                    }
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Products',
                    font: {
                        size: 14,
                        weight: 'bold',
                    }
                },
            },
        },
    };
    // --- FIX ENDS HERE ---

    return (
        <div style={styles.analyticsContainer}>
            <h2 style={styles.pageTitle}>Product Analytics</h2>
            <div style={styles.chartGrid}>
                <div style={styles.chartWrapper}>
                    <h3 style={styles.chartTitle}>Product Price Distribution</h3>
                    <Bar data={chartData.priceData} options={barChartOptions} />
                </div>
                <div style={styles.chartWrapper}>
                    <h3 style={styles.chartTitle}>Top 10 Product Categories</h3>
                     <Pie data={chartData.categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>
        </div>
    );
}


function InfoPage() {
  return (
    <div style={styles.infoContainer}>
      <h2 style={styles.pageTitle}>Developer Information</h2>
      <div style={styles.infoCard}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Name:</span>
          <span style={styles.infoValue}>Nikhilesh Dubey</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Roll Number:</span>
          <span style={styles.infoValue}>102253008</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>College:</span>
          <span style={styles.infoValue}>Thapar Institute of Engineering and Technology</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Phone:</span>
          <span style={styles.infoValue}>+91 9041413468</span>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---

const styles = {
  appContainer: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f4f4f8',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#2c2c2e',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  navLink: {
    color: '#a9a9b3',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    margin: '0 0.25rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  navLinkActive: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    margin: '0 0.25rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    width: '100%',
    maxWidth: '800px',
    height: 'calc(100vh - 100px)',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    margin: '20px',
  },
  messageList: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
  },
  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1rem',
  },
  botMessage: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '1rem',
  },
  messageContent: {
    maxWidth: '75%',
    padding: '0.75rem 1rem',
    borderRadius: '18px',
    lineHeight: '1.5',
  },
  inputForm: {
    display: 'flex',
    padding: '1rem',
    borderTop: '1px solid #e5e5ea',
  },
  inputField: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #dcdce1',
    borderRadius: '20px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  sendButton: {
    marginLeft: '0.5rem',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: '#007aff',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease',
  },
  productCarousel: {
    display: 'flex',
    overflowX: 'auto',
    padding: '1rem 0 0.5rem 0',
    marginTop: '0.5rem',
    gap: '1rem',
  },
  productCard: {
    flex: '0 0 160px',
    border: '1px solid #e5e5ea',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
  },
  productInfo: {
    padding: '0.5rem',
  },
  productTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  productPrice: {
    fontSize: '0.75rem',
    color: '#6c757d',
    margin: '0.25rem 0 0 0',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0',
  },
  pageTitle: {
    textAlign: 'center',
    color: '#1c1c1e',
    marginBottom: '2rem',
  },
  chartTitle: {
      textAlign: 'center',
      color: '#3c3c43',
      marginBottom: '1.5rem',
      fontSize: '1.1rem',
      fontWeight: '600',
  },
  analyticsContainer: {
    width: '100%',
    padding: '2rem',
    height: '100%',
    overflowY: 'auto',
  },
  chartGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      height: 'calc(100% - 100px)',
  },
  chartWrapper: {
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      height: '500px', // Fixed height for charts
  },
  infoContainer: {
    width: '100%',
    maxWidth: '600px',
    padding: '2rem',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderBottom: '1px solid #e5e5ea',
  },

  infoLabel: {
    fontWeight: '600',
    color: '#1c1c1e',
  },
  infoValue: {
    color: '#6c757d',
  }
};

