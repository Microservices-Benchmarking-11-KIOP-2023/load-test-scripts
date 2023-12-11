import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    scenarios: {
        high: {
            executor: 'constant-vus',
            vus: 100,
            duration: '5m',
            startTime: '10m20s',
            exec: 'testCity',
            env: { MONTH: '07', DAYS: '31' }
        }
    }
};

const cities = {
    "Gdansk": {"lat": 54.3722, "lon": 18.6386},
    "Warsaw": {"lat": 52.2297, "lon": 21.0122},
    "Starogard": {"lat": 53.9639, "lon": 18.5269},
    "Elk": {"lat": 53.8281, "lon": 22.3647}
};

export function testCity() {
    const cityNames = Object.keys(cities);
    const stayLengths = [1, 7, 14];
    const month = __ENV.MONTH;
    const daysInMonth = __ENV.DAYS;
    const cityIndex = __VU % cityNames.length;
    const cityName = cityNames[cityIndex];
    const { lat, lon } = cities[cityName];

    stayLengths.forEach(length => {
        const maxStartDay = daysInMonth - length;
        const startDay = Math.floor(Math.random() * maxStartDay) + 1;
        const inDate = generateDate(2023, month, startDay);
        let outDate = new Date(inDate);
        outDate.setDate(outDate.getDate() + length);
        const outDateString = outDate.toISOString().split('T')[0];

        const res = http.get(`http://${__ENV.MY_HOSTNAME}/hotels?inDate=${inDate}&outDate=${outDateString}&lat=${lat}&lon=${lon}`);

        check(res, {
            [`[${cityName}, ${month}, ${length} days, start: ${startDay}] response status is 200`]: (r) => r.status === 200,
        });

        sleep(1);
    });
}

function generateDate(year, month, day) {
    return `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export function handleSummary(data) {
    return {
        '/results/high-data-amount.json': JSON.stringify({
            metrics: {
                http_reqs: data.metrics.http_reqs,
                http_req_duration: data.metrics.http_req_duration,
                http_req_waiting: data.metrics.http_req_waiting,
                http_req_connecting: data.metrics.http_req_connecting,
                http_req_tls_handshaking: data.metrics.http_req_tls_handshaking,
                http_req_blocked: data.metrics.http_req_blocked,
                http_req_receiving: data.metrics.http_req_receiving,
                http_reqs_failed: data.metrics.http_reqs_failed,
                iterations: data.metrics.iterations,
                vus: data.metrics.vus,
                vus_max: data.metrics.vus_max,
                data_sent: data.metrics.data_sent,
                data_received: data.metrics.data_received,
            },
        }),
    };
}
