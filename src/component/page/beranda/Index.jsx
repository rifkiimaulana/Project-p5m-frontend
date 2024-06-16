import React, { useState, useEffect, useRef } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chart from 'chart.js/auto';

const API_LINK = 'http://localhost:5255/api/';

export default function BerandaIndex() {
  const today = new Date().toISOString().split('T')[0];

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Jumlah Pelanggaran',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  });

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [top3MahasiswaMelanggar, setTop3MahasiswaMelanggar] = useState([]);
  const [top3MahasiswaTanpaPelanggaran, setTop3MahasiswaTanpaPelanggaran] = useState([]);
  const [mahasiswaData, setMahasiswaData] = useState([]);
  const chartRef = useRef(null);
  const [dataFetched, setDataFetched] = useState(false); // Flag untuk mengecek apakah data sudah di-fetch

  const fetchChartData = async (startDate = null, endDate = null) => {
    try {
      const body = startDate && endDate ? { startDate, endDate } : {};
      const response = await fetch(`${API_LINK}dashboard/grafikbar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      const labels = data.map(item => item.Tingkat);
      const values = data.map(item => item.JumlahDataMhs);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Jumlah Pelanggaran',
            data: values,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const fetchMahasiswaData = async () => {
    try {
      const response = await fetch('https://api.polytechnic.astra.ac.id:2906/api_dev/efcc359990d14328fda74beb65088ef9660ca17e/SIA/getListMahasiswa?id_konsentrasi=3');
      const data = await response.json();

      console.log('Data received from API:', data);

      if (Array.isArray(data)) {
        const filteredData = data.filter(mahasiswa => mahasiswa.kelas.includes('222303'));

        console.log('Filtered Data:', filteredData);

        setMahasiswaData(filteredData);
        setDataFetched(true); // Set flag to true once data is fetched
      } else {
        console.error('Data received is not an array');
      }
    } catch (error) {
      console.error('Error fetching mahasiswa data:', error);
    }
  };

  const fetchFotoMahasiswa = async (nim) => {
    try {
      const response = await fetch(`https://api.polytechnic.astra.ac.id:2906/api_dev/efcc359990d14328fda74beb65088ef9660ca17e/SIA/getMahasiswa2?nim=${nim}`);
      const data = await response.json();
      return data[0].dul_pas_foto;
    } catch (error) {
      console.error(`Error fetching foto for NIM ${nim}:`, error);
      return null;
    }
  };

  const fetchTop3MahasiswaMelanggar = async () => {
    try {
      const response = await fetch(`${API_LINK}dashboard/melanggar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      const top3WithNames = await Promise.all(data.map(async item => {
        const mahasiswa = mahasiswaData.find(mhs => mhs.nim === item.mhs_id);
        const dul_pas_foto = mahasiswa ? await fetchFotoMahasiswa(mahasiswa.nim) : null;

        return {
          ...item,
          name: mahasiswa ? mahasiswa.nama : 'Unknown',
          kelas: mahasiswa ? mahasiswa.kelas : 'Unknown',
          image: dul_pas_foto ? `https://sia.polytechnic.astra.ac.id/Files/${dul_pas_foto}` : 'https://via.placeholder.com/70',
        };
      }));

      setTop3MahasiswaMelanggar(top3WithNames);
    } catch (error) {
      console.error('Error fetching top 3 mahasiswa melanggar:', error);
    }
  };

  const getTop3MahasiswaTanpaPelanggaran = async () => {
    const top3WithNames = await Promise.all(mahasiswaData.slice(0, 3).map(async (student) => {
      const dul_pas_foto = student ? await fetchFotoMahasiswa(student.nim) : null;

      return {
        name: student ? student.nama : 'Unknown',
        kelas: student ? student.kelas : 'Unknown',
        image: dul_pas_foto ? `https://sia.polytechnic.astra.ac.id/Files/${dul_pas_foto}` : 'https://via.placeholder.com/70',
      };
    }));

    setTop3MahasiswaTanpaPelanggaran(top3WithNames);
  };

  useEffect(() => {
    fetchChartData(startDate, endDate);
    if (!dataFetched) {
      fetchMahasiswaData();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (mahasiswaData.length > 0) {
      fetchTop3MahasiswaMelanggar();
      getTop3MahasiswaTanpaPelanggaran();
    }
  }, [mahasiswaData]);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mt-5">
      <Tabs defaultActiveKey="beranda" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="beranda" title="Beranda">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title">Selamat Datang di Sistem Informasi P5M</h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Sistem Informasi P5M ini akan membantu Anda dalam mengelola proses P5M dengan lebih efisien.
                <br />
                Mari mulai dengan mengeksplorasi fitur-fitur yang ada dengan mengakses menu yang tersedia.
              </p>
            </div>
          </div>
        </Tab>
        <Tab eventKey="operasional" title="Diagram">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title">Diagram P5M</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Tanggal Awal:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    max={today}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label>Tanggal Akhir:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6" style={{ overflow: 'hidden' }}>
                  {chartData.labels.length > 0 && (
                    <Bar ref={chartRef} data={chartData} options={options} height={200} />
                  )}
                </div>
                <div className="col-md-5">
                  <div>
                    <h5>TOP 3 Mahasiswa Tanpa Pelanggaran</h5>
                    {top3MahasiswaTanpaPelanggaran.map((student, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <img src={student.image} alt="student" className="me-3 rounded-circle" style={{ width: '70px', height: '70px' }} />
                        <div>
                          <div>{student.name}</div>
                          <div>Kelas: {student.kelas}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h5>TOP 3 Mahasiswa Sering Melanggar</h5>
                    {top3MahasiswaMelanggar.map((student, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <img src={student.image} alt="student" className="me-3 rounded-circle" style={{ width: '70px', height: '70px' }} />
                        <div>
                          <div>{student.name}</div>
                          <div>Kelas: {student.kelas}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
