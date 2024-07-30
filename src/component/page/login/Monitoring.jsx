import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import axios from 'axios';

const API_LINK = 'http://localhost:5255/api/';




export default function BerandaIndex() {
  const today = new Date().toISOString().split('T')[0];
  // const defaultStartDate = '2024-05-01';

  const [chartDataPelanggaran, setChartDataPelanggaran] = useState({
    labels: ['Telat', 'ID Card', 'Nametag', 'Rambut', 'Sepatu'],
    datasets: [
      {
        label: 'Jumlah Pelanggaran',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  });



  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [top3MahasiswaMelanggar, setTop3MahasiswaMelanggar] = useState([]);
  const [mahasiswaData, setMahasiswaData] = useState([]);
  const chartRef = useRef(null);
  const [dataFetched, setDataFetched] = useState(false);

  const [loadingChartDataPelanggaran, setLoadingChartDataPelanggaran] = useState(false);
  const [loadingMahasiswaData, setLoadingMahasiswaData] = useState(false);
  const [loadingTop3MahasiswaMelanggar, setLoadingTop3MahasiswaMelanggar] = useState(false);
  
  const [top3MahasiswaMelanggarHariIni, setTop3MahasiswaMelanggarHariIni] = useState([]);
  const [loadingTop3MahasiswaMelanggarHariIni, setLoadingTop3MahasiswaMelanggarHariIni] = useState(false);

  const fetchChartDataPelanggaran = async (startDate = null, endDate = null) => {
    setLoadingChartDataPelanggaran(true);
    try {
      const body = startDate && endDate ? { startDate, endDate } : {};
      const response = await fetch(`${API_LINK}dashboard/grafikbarpelanggaran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
  
      // Assuming data is an array of objects with class names and violation counts
      const values = data.map(item => ({
        label: item.kel_nama,
        Telat: item.Telat,
        ID_Card: item.ID_Card,
        Nametag: item.Nametag,
        Rambut: item.Rambut,
        Sepatu: item.Sepatu
      }));
  
      // Preparing the datasets for the chart
      const chartData = {
        labels: values.map(item => item.label),
        datasets: [
          {
            label: 'Telat',
            data: values.map(item => item.Telat),
            backgroundColor: '#A5C3DC',
          },
          {
            label: 'ID Card',
            data: values.map(item => item.ID_Card),
            backgroundColor: '#8EA9C4',
          },
          {
            label: 'Nametag',
            data: values.map(item => item.Nametag),
            backgroundColor: '#7C97B3',
          },
          {
            label: 'Rambut',
            data: values.map(item => item.Rambut),
            backgroundColor: '#6A86A2',
          },
          {
            label: 'Sepatu',
            data: values.map(item => item.Sepatu),
            backgroundColor: '#586F8B',
          }
        ],
      };
  
      setChartDataPelanggaran(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoadingChartDataPelanggaran(false);
    }
  };

  

  const fetchMahasiswaData = async () => {
    setLoadingMahasiswaData(true);
    try {
      const response = await fetch('https://api.polytechnic.astra.ac.id:2906/api_dev/efcc359990d14328fda74beb65088ef9660ca17e/SIA/getListMahasiswa?id_konsentrasi=3');
      const data = await response.json();

      if (Array.isArray(data)) {
        const filteredData = data.filter(mahasiswa => mahasiswa.kelas.includes('222303'));
        setMahasiswaData(filteredData);
        setDataFetched(true);
      } else {
        console.error('Data received is not an array');
      }
    } catch (error) {
      console.error('Error fetching mahasiswa data:', error);
    } finally {
      setLoadingMahasiswaData(false);
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
    setLoadingTop3MahasiswaMelanggar(true);
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
    } finally {
      setLoadingTop3MahasiswaMelanggar(false);
    }
  };


  const fetchTop3MahasiswaMelanggarHariIni = async () => {
    setLoadingTop3MahasiswaMelanggarHariIni(true);
    try {
      const response = await fetch(`${API_LINK}dashboard/melanggarHariIni`, {
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

      setTop3MahasiswaMelanggarHariIni(top3WithNames);
    } catch (error) {
      console.error('Error fetching top 3 mahasiswa melanggar hari ini:', error);
    } finally {
      setLoadingTop3MahasiswaMelanggarHariIni(false);
    }
  };

  useEffect(() => {
    //fetchMahasiswaData1();
    fetchChartDataPelanggaran(startDate, endDate);
    if (!dataFetched) {
      fetchMahasiswaData();
    }
   
  }, [startDate, endDate]);

  useEffect(() => {
    if (mahasiswaData.length > 0) {
      fetchTop3MahasiswaMelanggar();
      fetchTop3MahasiswaMelanggarHariIni();
    }
  }, [mahasiswaData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            weight: 'bold',
          },
        },
      },
    },
  };
  

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {

          const response = await fetch(`${API_LINK}dashboard/cardKelas`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            
          });
          console.log('response' + response);
            const result = await response.json();
            setData(result);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    fetchData();
  }, []);

 
  const [kelasCountData, setKelasCountData] = useState({});
  
  useEffect(() => {
    fetchMahasiswaData1();
  }, []);



  // Fungsi card 
  const fetchMahasiswaData1 = async () => {
    setLoadingMahasiswaData(true);
    try {
      // Fetch data mahasiswa
      const responseMahasiswa = await fetch('https://api.polytechnic.astra.ac.id:2906/api_dev/efcc359990d14328fda74beb65088ef9660ca17e/SIA/getListMahasiswa?id_konsentrasi=3');
      const dataMahasiswa = await responseMahasiswa.json();
      console.log('Received data mahasiswa:', dataMahasiswa);
  
      if (Array.isArray(dataMahasiswa)) {
        const filteredMahasiswa = dataMahasiswa.filter(mahasiswa => mahasiswa.kelas.includes('222303'));
  
        const responseKelas = await fetch(`${API_LINK}dashboard/cardKelas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        const dataKelas = await responseKelas.json();
        console.log('Received data kelas:', dataKelas);
  
        if (Array.isArray(dataKelas)) {
          const kelasCountData = filteredMahasiswa.reduce((acc, curr) => {
            const kelasInfo = dataKelas.find(item => item.kel_nama === curr.kelas);
            console.log(`dataKelas dari MIS ${curr.kelas} with kelas info`, kelasInfo);
  
            if (!acc[curr.kelas]) {
              acc[curr.kelas] = { total: 0, telat: 0 };
            }
            acc[curr.kelas].total += 1;
            
            if (kelasInfo) {
              acc[curr.kelas].telat += kelasInfo.Telat || 0;
            }
            
            return acc;
          }, {});
  
          for (let kelas in kelasCountData) {
            const kelasInfo = dataKelas.find(item => item.kel_nama === kelas);
            if (kelasInfo) {
              kelasCountData[kelas].telat = kelasInfo.Telat || 0;
            }
          }
          
          const kelasInfoWithAttendance = {};
          for (let kelas in kelasCountData) {
            const total = kelasCountData[kelas].total;
            const telat = kelasCountData[kelas].telat;
            const hadir = total - telat;
            kelasInfoWithAttendance[kelas] = `${hadir}/${total}`;
          }
  
          setKelasCountData(kelasInfoWithAttendance);
        } else {
          console.error('Data kelas received is not an array');
        }
      } else {
        console.error('Data mahasiswa received is not an array');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingMahasiswaData(false);
    }
  };
  
  
  

  return (
    <div className="col-md-12">
      {loading && <div>Loading...</div>}
      {!loading && (
        <div>
        <div className="row mx-0" id="Monitoring_data" style={{ justifyContent: 'center' }}>
        {Object.keys(kelasCountData)
          .sort() // Mengurutkan kelas secara alfanumerik
          .map((kelas, index) => {
            const kelasShort = kelas.slice(-2); // Ambil dua karakter terakhir dari kelas
            const hadirTotal = kelasCountData[kelas]; // Dapatkan string "hadir/total" untuk kelas ini
            const [hadir, total] = hadirTotal.split('/'); // Pisahkan nilai hadir dan total
            const persentaseHadir = (hadir / total) * 100;

            let cardColor = '#007bff'; // Default warna biru jika lebih dari 90%
            if (persentaseHadir < 75) {
              cardColor = '#ffc107'; // Warna kuning jika kurang dari 75%
            }
            if (persentaseHadir < 50) {
              cardColor = '#dc3545'; // Warna merah jika kurang dari 50%
            }

            return (
              <div key={index} className="col-lg-1 col-md-3 mb-3">
                <div 
                  className="card" 
                  id="gradient2" 
                  style={{ 
                    height: '85px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '20px', 
                    backgroundColor: cardColor, // Warna kartu berdasarkan persentase kehadiran
                    color: 'white' 
                  }}
                >
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Kehadiran {kelasShort}</h5>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', lineHeight: '1' }}>{hadir}/{total}</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>Mahasiswa</p>
                </div>
              </div>
            );
          })}


          </div>
          <div className="col-md-12 mb-4">
            <div className="card mb-4">
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
                  <div className="col-md-12 mb-2">
                    <div className="card" style={{ height: '280px' }}>
                      <div className="card-body d-flex justify-content-center align-items-center">
                        {loadingChartDataPelanggaran && <Spinner animation="border" role="status" />}
                        {!loadingChartDataPelanggaran && chartDataPelanggaran.labels.length > 0 && (
                          <Bar ref={chartRef} data={chartDataPelanggaran} options={options} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="card" style={{ width: '48%' }}>
                <div className="card-header bg-primary text-white">
                  <center>
                    <h5 className="card-title">TOP 3 Akumulasi Mahasiswa Sering Melanggar</h5>
                  </center>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {loadingTop3MahasiswaMelanggar && <Spinner animation="border" role="status" />}
                  {!loadingTop3MahasiswaMelanggar && (
                    top3MahasiswaMelanggar.map((student, index) => (
                      <div key={index} className="d-flex align-items-center mb-3" style={{ width: '100%' }}>
                        <img
                          src={student.image}
                          alt="student"
                          className="me-3 rounded-circle"
                          style={{ width: '70px', height: '70px' }}
                        />
                        <div style={{ fontSize: '17px' }}>
                          <div>{student.name}</div>
                          <div>Kelas: {student.kelas}</div>
                          <div style={{ color: 'red' }}>Total Jam Minus: {student.total_jam_minus}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="card" style={{ width: '48%' }}>
                <div className="card-header bg-primary text-white">
                  <center>
                    <h5 className="card-title">TOP 3 Mahasiswa Melanggar Hari ini</h5>
                  </center>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {loadingTop3MahasiswaMelanggarHariIni && <Spinner animation="border" role="status" />}
                  {!loadingTop3MahasiswaMelanggarHariIni && (
                    top3MahasiswaMelanggarHariIni.map((student, index) => (
                      <div key={index} className="d-flex align-items-center mb-3" style={{ width: '100%' }}>
                        <img
                          src={student.image}
                          alt="student"
                          className="me-3 rounded-circle"
                          style={{ width: '70px', height: '70px' }}
                        />
                        <div style={{ fontSize: '17px' }}>
                          <div>{student.name}</div>
                          <div>Kelas: {student.kelas}</div>
                          <div style={{ color: 'red' }}>Total Jam Minus: {student.total_jam_minus}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
