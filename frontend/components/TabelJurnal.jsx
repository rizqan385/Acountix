import { formatRupiah } from '../utils/formatter';

const TabelJurnal = ({ data }) => {
  if (!data || !data.daftar_jurnal || data.daftar_jurnal.length === 0) {
    return null;
  }

  const totalDebit = data.daftar_jurnal.reduce((sum, j) => sum + (j.nominal_debit || 0), 0);
  const totalKredit = data.daftar_jurnal.reduce((sum, j) => sum + (j.nominal_kredit || 0), 0);
  const isBalance = totalDebit === totalKredit;

  return (
    <div style={{ marginTop: '12px' }}>
      <div className="jurnal-meta">
        <div className="jurnal-meta-item">
          🏢 <span>{data.nama_perusahaan || '-'}</span>
        </div>
        <div className="jurnal-meta-item">
          📅 <span>{data.periode || '-'}</span>
        </div>
        <div className="jurnal-meta-item">
          {isBalance ? '✅' : '⚠️'} <span>{isBalance ? 'Balance' : 'Tidak Balance!'}</span>
        </div>
      </div>

      <div className="jurnal-table-wrapper">
        <table className="jurnal-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Akun Debit</th>
              <th>Nominal Debit</th>
              <th>Akun Kredit</th>
              <th>Nominal Kredit</th>
            </tr>
          </thead>
          <tbody>
            {data.daftar_jurnal.map((jurnal, index) => (
              <tr key={index}>
                <td>{jurnal.tanggal}</td>
                <td>{jurnal.akun_debit}</td>
                <td className="nominal-debit">{formatRupiah(jurnal.nominal_debit)}</td>
                <td>{jurnal.akun_kredit}</td>
                <td className="nominal-kredit">{formatRupiah(jurnal.nominal_kredit)}</td>
              </tr>
            ))}
            <tr className="jurnal-total-row">
              <td colSpan="2" style={{ textAlign: 'right' }}>Total</td>
              <td className="nominal-debit">{formatRupiah(totalDebit)}</td>
              <td></td>
              <td className="nominal-kredit">{formatRupiah(totalKredit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelJurnal;
