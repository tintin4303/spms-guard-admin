const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Pagination component right before Overview
if (!content.includes('function Pagination')) {
  const paginationCode = `
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
      <span className="text-[13px] text-gray-500">Page {currentPage} of {totalPages}</span>
      <div className="flex gap-2">
        <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="px-3 py-1 border rounded text-[13px] disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors text-gray-700">Previous</button>
        <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="px-3 py-1 border rounded text-[13px] disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors text-gray-700">Next</button>
      </div>
    </div>
  );
}
`;
  content = content.replace('function Overview', paginationCode + '\nfunction Overview');
}

function addPaginationToComponent(componentName, dataVar, itemVar) {
  // Find component start
  const regex = new RegExp(`function ${componentName}\\([^)]*\\) {\\s*const \\[${dataVar}, set${dataVar.charAt(0).toUpperCase() + dataVar.slice(1)}\\] = useState<any\\[\\]>\\(\\[\\]\\);`, 'g');
  
  content = content.replace(regex, (match) => {
    return match + `\n const [currentPage, setCurrentPage] = useState(1);\n const itemsPerPage = 10;\n const totalPages = Math.ceil(${dataVar}.length / itemsPerPage);\n const paginatedData = ${dataVar}.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
  });

  // Replace map
  content = content.replace(new RegExp(`${dataVar}\\.map\\(\\(${itemVar}\\) => \\(`, 'g'), `paginatedData.map((${itemVar}) => (`);

  // Add Pagination component below table div
  // The table is usually wrapped in <div className="overflow-x-auto"> ... </table> </div>
  // We want to insert the Pagination right after the closing </div> of overflow-x-auto
  
  // This is a bit tricky with regex, we can find `</table>\n </div>` and append the pagination
  // But each component has its own table.
  // Actually, let's just replace `</table>\n </div>` globally within the component? No, there are multiple components.
}

addPaginationToComponent('ClientContracts', 'contracts', 'c');
addPaginationToComponent('AdminUserManagement', 'users', 'u');
addPaginationToComponent('Contracts', 'contracts', 'c');
addPaginationToComponent('Guards', 'guards', 'g');
addPaginationToComponent('Schedules', 'schedules', 'sched');

fs.writeFileSync(file, content);
console.log('Script ran, but table replacements need manual or better regex.');
