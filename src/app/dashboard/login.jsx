'use client';
import { 
  LayoutDashboard, Users, Calendar, Repeat, MessageSquare, BarChart2, 
  Plus, Bell, HelpCircle, LogOut, Wifi, AlertCircle, MessageCircle, 
  CheckCircle2, Clock, User 
} from 'lucide-react';

export default function Dashboard() {
  // Hard-coded theme to guarantee it works without Tailwind
  const theme = {
    bg: '#0b0c10',
    sidebar: '#111319',
    card: '#181a25',
    border: 'rgba(255,255,255,0.05)',
    text: '#ffffff',
    muted: '#8b949e',
    blue: '#4f86f7',
    green: '#4ade80',
  };

  const styles = {
    wrapper: { display: 'flex', height: '100vh', backgroundColor: theme.bg, color: theme.text, fontFamily: 'sans-serif', overflow: 'hidden' },
    
    // Top Nav
    topNav: { height: '64px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: theme.sidebar },
    navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
    navLink: { color: theme.muted, fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' },
    navLinkActive: { color: theme.blue, fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' },
    
    // Sidebar
    sidebar: { width: '240px', backgroundColor: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', padding: '24px 0' },
    sideItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: theme.muted, fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
    sideItemActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: theme.text, backgroundColor: 'rgba(79, 134, 247, 0.1)', borderLeft: `3px solid ${theme.blue}`, fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },
    
    // Main Content
    main: { flex: 1, overflowY: 'auto', padding: '40px' },
    
    // Cards & Elements
    card: { backgroundColor: theme.card, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}` },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    flexGap: { display: 'flex', alignItems: 'center', gap: '12px' },
    
    statBox: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px 24px', border: `1px solid ${theme.border}` },
    statNumber: { fontSize: '28px', fontWeight: 'bold', marginTop: '8px' },
    statLabel: { fontSize: '11px', color: theme.muted, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' },
    
    tag: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '13px', color: theme.muted, cursor: 'pointer' },
    tagActive: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '13px', color: theme.text, cursor: 'pointer' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: theme.bg }}>
      
      {/* TOP NAVIGATION */}
      <header style={styles.topNav}>
        <div style={styles.navLinks}>
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-1px', marginRight: '20px', color: 'white' }}>VYBE</span>
          <span style={styles.navLinkActive}>Dashboard</span>
          <span style={styles.navLink}>Meet People</span>
          <span style={styles.navLink}>Events</span>
        </div>
        <div style={styles.navLinks}>
          <Bell size={18} color={theme.muted} />
          <HelpCircle size={18} color={theme.muted} />
          <div style={{ width: '32px', height: '32px', backgroundColor: '#333', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="white" />
          </div>
        </div>
      </header>

      <div style={styles.wrapper}>
        
        {/* LEFT SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={{ padding: '0 24px 30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Vybe</div>
            <div style={{ fontSize: '11px', color: theme.muted }}>VIT Chennai Portal</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={styles.sideItemActive}><LayoutDashboard size={18} /> Dashboard</div>
            <div style={styles.sideItem}><Users size={18} /> Meet People</div>
            <div style={styles.sideItem}><Calendar size={18} /> Events</div>
            <div style={styles.sideItem}><Repeat size={18} /> Exchange</div>
            <div style={styles.sideItem}><MessageSquare size={18} /> Messages</div>
            <div style={styles.sideItem}><BarChart2 size={18} /> Leaderboard</div>
          </div>

          <div style={{ marginTop: 'auto', padding: '0 24px' }}>
            <button style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: theme.blue, color: 'white', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <Plus size={18} /> New Post
            </button>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.muted, fontSize: '12px', cursor: 'pointer' }}><HelpCircle size={14} /> Help</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.muted, fontSize: '12px', cursor: 'pointer' }}><LogOut size={14} /> Logout</div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={styles.main}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            
            {/* HERO SECTION */}
            <div style={{ ...styles.flexBetween, marginBottom: '40px' }}>
              <div style={styles.flexGap}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#222', borderRadius: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={32} color="white" />
                  <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '14px', height: '14px', backgroundColor: theme.green, border: `3px solid ${theme.bg}`, borderRadius: '50%' }} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: theme.muted, letterSpacing: '1px', fontWeight: 'bold', textTransform: 'uppercase' }}>Welcome Back, Aryan</div>
                  <h1 style={{ fontSize: '42px', fontWeight: '900', margin: 0, letterSpacing: '-1px', lineHeight: '1.1' }}>The VIT<br/>Vybe.</h1>
                </div>
              </div>
              <div style={styles.flexGap}>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Connections</div>
                  <div style={styles.statNumber}>128</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Events</div>
                  <div style={styles.statNumber}>14</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Trust Score</div>
                  <div style={{ ...styles.statNumber, color: theme.green }}>98%</div>
                </div>
              </div>
            </div>

            {/* 4 STAT CARDS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {[
                { label: 'Online Now', val: '452', icon: <Wifi size={14} color={theme.green} /> },
                { label: 'Events Today', val: '3', icon: <Calendar size={14} /> },
                { label: 'Open Exchanges', val: '12', icon: <Repeat size={14} /> },
                { label: 'Alerts', val: '2', icon: <AlertCircle size={14} color="#ef4444" /> }
              ].map((stat, i) => (
                <div key={i} style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.muted, fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
                    {stat.icon} {stat.label}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* MIDDLE ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              
              {/* Availability */}
              <div style={styles.card}>
                <div style={styles.flexBetween}>
                  <div>
                    <h3 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>Set Your Availability</h3>
                    <p style={{ color: theme.muted, fontSize: '13px', margin: 0 }}>Let others know what you're up for right now.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                    <div style={{ width: '36px', height: '20px', backgroundColor: theme.green, borderRadius: '10px', position: 'relative' }}>
                      <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: theme.green, fontWeight: 'bold' }}>ONLINE</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <div style={styles.tagActive}>🚶 Walk</div>
                  <div style={styles.tag}>🍕 Food</div>
                  <div style={styles.tag}>🚴 Cycling</div>
                  <div style={styles.tag}>🎮 Gaming</div>
                  <div style={styles.tag}>📚 Study</div>
                </div>
              </div>

              {/* Notice Ticker */}
              <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.muted, fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px' }}>
                  <Bell size={14} /> Notice Ticker
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', fontSize: '13px', fontStyle: 'italic', color: '#e2e8f0', marginBottom: '10px' }}>
                  "Hackathon registration ends in 2 hours. Don't miss out!"
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', fontSize: '13px', fontStyle: 'italic', color: '#e2e8f0' }}>
                  "New badminton tournament announced for Saturday."
                </div>
              </div>
            </div>

            {/* BOTTOM GRID (3 Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
              
              {/* Col 1: Available Now */}
              <div>
                <div style={{ ...styles.flexBetween, marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>Available Now</h3>
                  <span style={{ fontSize: '10px', color: theme.blue, fontWeight: 'bold', cursor: 'pointer' }}>SEE ALL</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Sarah Jenkins', act: 'Studying', color: theme.green },
                    { name: 'David Chen', act: 'Running', color: theme.green },
                    { name: 'Leo Marcus', act: 'Valorant', color: '#eab308' }
                  ].map((user, i) => (
                    <div key={i} style={{ ...styles.card, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={styles.flexGap}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#333', borderRadius: '10px', position: 'relative' }}>
                           <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', backgroundColor: user.color, borderRadius: '50%', border: `2px solid ${theme.card}` }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user.name}</div>
                          <div style={{ fontSize: '11px', color: theme.muted }}>🎮 {user.act}</div>
                        </div>
                      </div>
                      <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <MessageCircle size={14} color={theme.muted} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: Events & Exchanges */}
              <div>
                <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Upcoming Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                  {[
                    { d: 'OCT', n: '24', t: 'Digital Art Workshop', loc: '4:00 PM • MG Auditorium' },
                    { d: 'OCT', n: '26', t: 'Chess Blitz Night', loc: '6:30 PM • Gazebo 4' }
                  ].map((ev, i) => (
                    <div key={i} style={{ ...styles.card, padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px', textAlign: 'center', minWidth: '48px' }}>
                        <div style={{ fontSize: '10px', color: theme.muted, fontWeight: 'bold' }}>{ev.d}</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{ev.n}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{ev.t}</div>
                        <div style={{ fontSize: '11px', color: theme.muted }}>{ev.loc}</div>
                      </div>
                      <button style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>Join</button>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Recent Exchanges</h3>
                <div style={{ ...styles.card, padding: '20px' }}>
                  <div style={{ fontSize: '10px', color: theme.muted, fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>ACTIVITY LOG</div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '28px', height: '28px', backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={14} color={theme.green} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px' }}>Lent <b>Calculus II Notes</b> to Rohan</div>
                      <div style={{ fontSize: '9px', color: theme.muted, marginTop: '2px', textTransform: 'uppercase' }}>COMPLETED • 2H AGO</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={14} color={theme.muted} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px' }}>Request: <b>MacBook Charger</b></div>
                      <div style={{ fontSize: '9px', color: theme.muted, marginTop: '2px', textTransform: 'uppercase' }}>AWAITING RESPONSE • 5H AGO</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3: Your Activity */}
              <div>
                <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Your Activity</h3>
                <div style={{ ...styles.card, padding: '24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: 'rgba(79, 134, 247, 0.1)', color: theme.blue, padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', border: `1px solid rgba(79, 134, 247, 0.3)` }}>PRO MEMBER</div>
                    <div style={{ fontSize: '11px', color: theme.muted, textAlign: 'right' }}>Rank #42<br/>Global</div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '10px', color: theme.muted, fontWeight: 'bold', letterSpacing: '1px' }}>DAILY STREAK</div>
                    <div style={{ fontSize: '48px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      12 <span style={{ fontSize: '24px' }}>🔥</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: theme.muted }}>Pings Sent</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>24</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: theme.muted }}>Joined</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>08</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ ...styles.flexBetween, fontSize: '11px', marginBottom: '8px' }}>
                      <span style={{ color: theme.muted }}>Level 14</span>
                      <span style={{ color: theme.muted }}>240/500 XP</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '48%', height: '100%', backgroundColor: theme.blue, borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>

                {/* Meetup CTA Card */}
                <div style={{ borderRadius: '20px', padding: '24px', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', boxShadow: '0 20px 40px rgba(168, 85, 247, 0.2)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'white' }}>Host Your Own Meetup</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '0 0 20px 0', lineHeight: '1.4' }}>Create an event and earn +50 Trust Points.</p>
                  <button style={{ padding: '10px 20px', backgroundColor: 'white', color: '#6366f1', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Get Started</button>
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}