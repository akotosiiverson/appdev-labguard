export let reportBooks = JSON.parse(localStorage.getItem('reportBooks'));

if(reportBooks === null || reportBooks === undefined){
    reportBooks = [{
        facultyName:'Jiro Dichos',
        date:'Apr 20, 2025',
        productName: 'Laptop',
        roomNumber:'519',
        pcNumber:19,
        facultyPosition: 'Part-time',
        issue:'wala lang',
        reportImage:'/asset/icons/computer-icon.png'
    }]
}

export function saveToStorage(){
    localStorage.setItem('reportBooks', JSON.stringify(reportBooks));
 };

export function addToReportBook(reportData){

   reportBooks.push(reportData);
    console.log('work');
    saveToStorage();
   
  }