// Quick test to verify icons are available
import { FiAward, FiCode, FiShield, FiStar, FiUsers } from 'react-icons/fi';

console.log('Icons available:', {
  FiAward: !!FiAward,
  FiCode: !!FiCode, 
  FiShield: !!FiShield,
  FiStar: !!FiStar,
  FiUsers: !!FiUsers
});

export default function IconTest() {
  return (
    <div>
      <FiAward />
      <FiCode />
      <FiShield />
      <FiStar />
      <FiUsers />
    </div>
  );
}
