import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";

const calendarData = [
  {
    date: "September 7",
    events: [
      {
        time: "12:00 AM",
        country: "US",
        flag: "🇺🇸",
        event: "Independence Day",
        impact: "low",
        actual: "—",
        forecast: "—",
        previous: "—",
      },
      {
        time: "12:00 AM",
        country: "US",
        flag: "🇺🇸",
        event: "Labor Day",
        impact: "low",
        actual: "—",
        forecast: "—",
        previous: "—",
      },
      {
        time: "12:00 AM",
        country: "CA",
        flag: "🇨🇦",
        event: "Labor Day",
        impact: "low",
        actual: "—",
        forecast: "—",
        previous: "—",
      },
      {
        time: "01:30 AM",
        country: "AU",
        flag: "🇦🇺",
        event: "Economic Activity",
        impact: "medium",
        actual: "—",
        forecast: "—",
        previous: "—",
      },
      {
        time: "03:00 AM",
        country: "JP",
        flag: "🇯🇵",
        event: "Consumer Confidence",
        impact: "medium",
        actual: "—",
        forecast: "36.8",
        previous: "36.7",
      },
      {
        time: "05:30 AM",
        country: "GB",
        flag: "🇬🇧",
        event: "House Price Index",
        impact: "low",
        actual: "—",
        forecast: "0.2%",
        previous: "0.1%",
      },
      {
        time: "08:30 AM",
        country: "DE",
        flag: "🇩🇪",
        event: "Industrial Production",
        impact: "high",
        actual: "—",
        forecast: "0.4%",
        previous: "-1.9%",
      },
      {
        time: "10:00 AM",
        country: "EU",
        flag: "🇪🇺",
        event: "Retail Sales",
        impact: "medium",
        actual: "—",
        forecast: "0.3%",
        previous: "0.6%",
      },
      {
        time: "12:30 PM",
        country: "US",
        flag: "🇺🇸",
        event: "Economic Outlook",
        impact: "high",
        actual: "—",
        forecast: "—",
        previous: "—",
      },
      {
        time: "02:00 PM",
        country: "US",
        flag: "🇺🇸",
        event: "Federal Reserve Speech",
        impact: "high",
        actual: "—",
        forecast: "—",
        previous: "—",
      },
      {
        time: "04:30 PM",
        country: "CA",
        flag: "🇨🇦",
        event: "Business Outlook",
        impact: "medium",
        actual: "—",
        forecast: "—",
        previous: "—",
      },
    ],
  },
  {
    date: "September 8",
    events: [
      {
        time: "01:00 AM",
        country: "JP",
        flag: "🇯🇵",
        event: "GDP Growth Rate",
        impact: "high",
        actual: "—",
        forecast: "0.3%",
        previous: "0.2%",
      },
      {
        time: "06:00 AM",
        country: "GB",
        flag: "🇬🇧",
        event: "Construction PMI",
        impact: "medium",
        actual: "—",
        forecast: "44.0",
        previous: "45.9",
      },
      {
        time: "08:30 AM",
        country: "EU",
        flag: "🇪🇺",
        event: "ECB Interest Rate Decision",
        impact: "high",
        actual: "—",
        forecast: "2.15%",
        previous: "2.15%",
      },
      {
        time: "01:30 PM",
        country: "US",
        flag: "🇺🇸",
        event: "Crude Oil Inventories",
        impact: "medium",
        actual: "—",
        forecast: "-1.2M",
        previous: "-2.4M",
      },
    ],
  },
];

function EconomicCalendar() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All");
  const [impact, setImpact] = useState("All");
  const [activeTab, setActiveTab] = useState("calendar");

  const countries = useMemo(() => {
    const values = calendarData.flatMap((day) =>
      day.events.map((event) => event.country)
    );

    return ["All", ...new Set(values)];
  }, []);

  const filteredData = useMemo(() => {
    return calendarData
      .map((day) => ({
        ...day,
        events: day.events.filter((event) => {
          const searchValue = search.toLowerCase();

          const matchesSearch =
            event.event.toLowerCase().includes(searchValue) ||
            event.country.toLowerCase().includes(searchValue);

          const matchesCountry =
            country === "All" || event.country === country;

          const matchesImpact =
            impact === "All" || event.impact === impact;

          return (
            matchesSearch &&
            matchesCountry &&
            matchesImpact
          );
        }),
      }))
      .filter((day) => day.events.length > 0);
  }, [search, country, impact]);

  return (
    <section className="economic-calendar">
      {/* Header */}
      <div className="economic-calendar-header">
        <div className="economic-calendar-title">
          <div className="economic-calendar-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2>Economic Calendar</h2>
            <p>Market-moving economic events</p>
          </div>
        </div>

        <button
          type="button"
          className="calendar-refresh-button"
          onClick={() => window.location.reload()}
          title="Refresh calendar"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Tabs */}
      <div className="economic-calendar-tabs">
        <button
          type="button"
          className={activeTab === "calendar" ? "active" : ""}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar
        </button>

        <button
          type="button"
          className={activeTab === "today" ? "active" : ""}
          onClick={() => setActiveTab("today")}
        >
          Today
        </button>

        <button
          type="button"
          className={activeTab === "week" ? "active" : ""}
          onClick={() => setActiveTab("week")}
        >
          This Week
        </button>
      </div>

      {/* Filters */}
      <div className="economic-calendar-filters">
        <div className="calendar-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search events"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="calendar-filter">
          <Filter size={15} />

          <select
            value={country}
            onChange={(event) =>
              setCountry(event.target.value)
            }
          >
            {countries.map((item) => (
              <option key={item} value={item}>
                {item === "All"
                  ? "All Countries"
                  : item}
              </option>
            ))}
          </select>

          <ChevronDown size={15} />
        </div>

        <div className="calendar-filter">
          <select
            value={impact}
            onChange={(event) =>
              setImpact(event.target.value)
            }
          >
            <option value="All">All Impact</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>

          <ChevronDown size={15} />
        </div>
      </div>

      {/* Table */}
      <div className="economic-calendar-table">
        {/* Table Head */}
        <div className="calendar-table-head">
          <span>Time</span>
          <span>Event</span>
          <span>Actual</span>
          <span>Forecast</span>
          <span>Previous</span>
        </div>

        {/* Events */}
        <div className="calendar-scroll-area">
          {filteredData.length === 0 && (
            <div className="calendar-empty">
              <CalendarDays size={32} />
              <strong>No events found</strong>
              <span>
                Try changing your search or filters.
              </span>
            </div>
          )}

          {filteredData.map((day) => (
            <div
              className="calendar-day"
              key={day.date}
            >
              <div className="calendar-date">
                <span>{day.date}</span>
              </div>

              {day.events.map((item, index) => (
                <div
                  className="calendar-event-row"
                  key={`${item.event}-${index}`}
                >
                  <div className="calendar-time">
                    {item.time}
                  </div>

                  <div className="calendar-event">
                    <span className="calendar-country">
                      {item.flag}
                    </span>

                    <div className="calendar-event-info">
                      <strong>{item.event}</strong>

                      <div className="calendar-event-meta">
                        <span>
                          {item.country}
                        </span>

                        <span
                          className={`impact-dot ${item.impact}`}
                          title={`${item.impact} impact`}
                        >
                          ●
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="calendar-value actual">
                    {item.actual}
                  </div>

                  <div className="calendar-value">
                    {item.forecast}
                  </div>

                  <div className="calendar-value">
                    {item.previous}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EconomicCalendar;