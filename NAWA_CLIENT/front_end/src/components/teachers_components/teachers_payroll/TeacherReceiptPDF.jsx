import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid'
  },
  headerLeftContent: {
    width: '60%'
  },
  headerRightContent: {
    width: '40%',
    alignItems: 'flex-end'
  },
  schoolLogo: {
    width: 100,
    height: 'auto',
    marginBottom: 5,
    objectFit: 'contain'
  },
  schoolName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  schoolAddress: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2
  },
  receiptTag: {
    backgroundColor: '#0a66c2',
    color: 'white',
    padding: 6,
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 4,
    marginTop: 5,
    alignSelf: 'flex-start'
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5
  },
  receiptSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5
  },
  receiptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid'
  },
  receiptNumber: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 2
  },
  receiptNumberValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827'
  },
  dateSection: {
    textAlign: 'right'
  },
  dateLabel: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 2
  },
  dateValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827'
  },
  contentColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  teacherSection: {
    width: '48%',
  },
  salarySection: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    textTransform: 'uppercase'
  },
  teacherInfo: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#0a66c2',
    borderLeftStyle: 'solid'
  },
  infoRow: {
    marginBottom: 6
  },
  infoLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 1
  },
  infoValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: 'medium'
  },
  monthHighlight: {
    backgroundColor: '#0a66c2',
    color: 'white',
    padding: 6,
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 4,
    marginBottom: 10,
    textAlign: 'center'
  },
  salaryTable: {
    width: '100%',
    marginBottom: 15
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  salaryItem: {
    fontSize: 10,
    color: '#4b5563'
  },
  salaryAmount: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#111827',
    textAlign: 'right'
  },
  totalSection: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151'
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a66c2'
  },
  footer: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureSection: {
    width: '30%',
    alignItems: 'center'
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    borderBottomStyle: 'solid',
    width: '100%',
    marginBottom: 5
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center'
  },
  notesSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#d1d5db',
    borderLeftStyle: 'solid'
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 4
  },
  notesContent: {
    fontSize: 8,
    color: '#6b7280'
  },
  remarksSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#d1d5db',
    borderLeftStyle: 'solid'
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 4
  },
  remarksValue: {
    fontSize: 8,
    color: '#6b7280'
  }
});

const TeacherReceiptPDF = ({ data }) => {
  // Ensure all required data is present with defaults
  const {
    month = 'Unknown Month',
    teacherName = 'Unknown Teacher',
    teacherId = 'Unknown ID',
    position = 'Teacher',
    salary = 0,
    allowance = 0,
    total = 0,
    date = new Date().toISOString(),
    remarks = '',
    status = 'pending'
  } = data || {};

  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate receipt number
  const receiptNumber = `REC-${teacherId}-${month}-${Date.now().toString().slice(-6)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeftContent}>
            <Text style={styles.schoolName}>NAWA School</Text>
            <Text style={styles.schoolAddress}>Kathmandu, Nepal</Text>
            <Text style={styles.schoolAddress}>Phone: 021460535</Text>
          </View>
          <View style={styles.headerRightContent}>
            <Text style={styles.receiptTag}>SALARY RECEIPT</Text>
          </View>
        </View>

        {/* Receipt Title */}
        <Text style={styles.receiptTitle}>Salary Payment Receipt</Text>
        <Text style={styles.receiptSubtitle}>For the month of {month}</Text>

        {/* Receipt Meta */}
        <View style={styles.receiptMeta}>
          <View>
            <Text style={styles.receiptNumber}>Receipt Number</Text>
            <Text style={styles.receiptNumberValue}>{receiptNumber}</Text>
          </View>
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Date</Text>
            <Text style={styles.dateValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentColumns}>
          {/* Teacher Information */}
          <View style={styles.teacherSection}>
            <Text style={styles.sectionTitle}>Teacher Information</Text>
            <View style={styles.teacherInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{teacherName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID</Text>
                <Text style={styles.infoValue}>{teacherId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Position</Text>
                <Text style={styles.infoValue}>{position}</Text>
              </View>
            </View>
          </View>

          {/* Salary Information */}
          <View style={styles.salarySection}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <Text style={styles.monthHighlight}>{month} {new Date().getFullYear()}</Text>
            <View style={styles.salaryTable}>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryItem}>Basic Salary</Text>
                <Text style={styles.salaryAmount}>Rs. {salary.toLocaleString()}</Text>
              </View>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryItem}>Allowance</Text>
                <Text style={styles.salaryAmount}>Rs. {allowance.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>Rs. {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Remarks */}
        {remarks && (
          <View style={styles.remarksSection}>
            <Text style={styles.remarksLabel}>Remarks</Text>
            <Text style={styles.remarksValue}>{remarks}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureLine}>_________________</Text>
            <Text style={styles.signatureLabel}>Teacher's Signature</Text>
          </View>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureLine}>_________________</Text>
            <Text style={styles.signatureLabel}>Accountant's Signature</Text>
          </View>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureLine}>_________________</Text>
            <Text style={styles.signatureLabel}>Principal's Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default TeacherReceiptPDF;