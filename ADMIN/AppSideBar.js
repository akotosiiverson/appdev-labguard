const user = JSON.parse(localStorage.getItem('user'));
const userName = user.fullName || 'Jiro Dichos';
const userRole = user.role || 'Borrower';

class AppSidebar extends HTMLElement {
    connectedCallback() {
        const style = document.createElement('style');
        style.textContent = `
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100%;
            background: var(--color-white);
            z-index: 2000;
            font-family: var(--font-secondary);
            transition: all var(--transition-speed) ease;
            overflow-x: hidden;
            scrollbar-width: none;
        }
        
        .sidebar::-webkit-scrollbar {
            display: none;
        }
        
        .sidebar.hide {
            width: 60px;
        }
        
        /* Brand logo and text */
        .sidebar__brand {
            font-size: 24px;
            font-weight: 700;
            height: 56px;
            display: flex;
            align-items: center;
            color: var(--color-accent);
            position: sticky;
            top: 0;
            left: 0;
            background: var(--color-white);
            z-index: 500;
            padding-bottom: 20px;
            box-sizing: content-box;
        }
        
        .sidebar__logo {
            width: 40px;
            height: 40px;
            margin-left: 10px;
            margin-right: 10px;
            border-radius: var(--border-radius-round);
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .sidebar__title {
            transition: var(--transition-speed) ease;
            white-space: nowrap;
            overflow: hidden;
        }
        
        /* Menu container */
        .sidebar__menu {
            width: 100%;
            margin-top: 48px;
        }
        
        .sidebar__menu--bottom {
            position: absolute;
            bottom: 48px;
            left: 0;
            width: 100%;
        }
        
        /* Menu items */
        .sidebar__item {
            height: 48px;
            background: transparent;
            margin-left: 6px;
            border-radius: 48px 0 0 48px;
            padding: 4px;
        }
        
        .sidebar__item--active {
            background: var(--color-gray-light);
            position: relative;
        }
        
        /* Top curve effect for active item */
        .sidebar__item--active::before {
            content: '';
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: var(--border-radius-round);
            top: -40px;
            right: 0;
            box-shadow: 20px 20px 0 var(--color-gray-light);
            z-index: -1;
        }
        
        /* Bottom curve effect for active item */
        .sidebar__item--active::after {
            content: '';
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: var(--border-radius-round);
            bottom: -40px;
            right: 0;
            box-shadow: 20px -20px 0 var(--color-gray-light);
            z-index: -1;
        }
        
        /* Link styling */
        .sidebar__link {
            width: 100%;
            height: 100%;
            background: var(--color-white);
            display: flex;
            align-items: center;
            border-radius: 48px;
            font-size: 16px;
            color: var(--color-dark);
            white-space: nowrap;
            overflow-x: hidden;
            transition: all .15s ease;
        }
        
        .sidebar__link:hover {
            color: var(--color-accent);
        }
        
        .sidebar__item--active .sidebar__link {
            color: var(--color-accent);
        }
        
        .sidebar__link--logout {
            color: var(--color-danger);
        }
        
        /* Collapsed sidebar link size */
        .sidebar.hide .sidebar__link {
            width: calc(48px - (4px * 2));
            transition: width var(--transition-speed) ease;
        }
        
        /* Icon alignment in sidebar */
        .sidebar__link i {
            min-width: calc(60px - ((4px + 6px) * 2));
            display: flex;
            justify-content: center;
        }
        
        .sidebar__text {
            transition: var(--transition-speed) ease;
            white-space: nowrap;
            overflow: hidden;
        }
        
        /* Hide text when sidebar is collapsed */
        .sidebar.hide .sidebar__text {
            display: none;
        }
        
        /* Hide title when sidebar is collapsed */
        .sidebar.hide .sidebar__title {
            display: none;
        }
        
        /* Main content area styles */
        .main {
            position: relative;
            width: calc(100% - 280px);
            left: 280px;
            transition: all var(--transition-speed) ease;
        }
        
        /* Adjust content width when sidebar is collapsed */
        .sidebar.hide ~ .main {
            width: calc(100% - 60px);
            left: 60px;
        }

        /* Media queries for responsive design */
        @media screen and (max-width: 992px) {
            .sidebar {
                width: 200px;
            }
            
            .main {
                width: calc(100% - 200px);
                left: 200px;
            }
            
            .sidebar.hide ~ .main {
                width: calc(100% - 60px);
                left: 60px;
            }
        }
        
        /* For tablets (768px and below) */
        @media screen and (max-width: 768px) {
            .sidebar {
                width: 60px;
            }
            
            .sidebar.hide {
                left: -60px;
            }
            
            .main {
                width: calc(100% - 60px);
                left: 60px;
            }
            
            .sidebar.hide ~ .main {
                width: 100%;
                left: 0;
            }
            
            .sidebar__title {
                display: none;
            }
            
            .sidebar__link {
                width: calc(48px - (4px * 2));
            }
            
            .sidebar__text {
                display: none;
            }
        }
        
        /* For mobile phones (576px and below) */
        @media screen and (max-width: 576px) {
            .sidebar {
                left: -60px;
            }
            
            .main {
                width: 100%;
                left: 0;
            }
            
            /* When menu is active, show sidebar */
            .sidebar.show {
                left: 0;
            }
        }
        
        /* Override for landscape orientation on mobile */
        @media screen and (max-height: 450px) {
            .sidebar {
                overflow-y: auto;
            }
            
            .sidebar__menu {
                margin-top: 24px;
            }
            
            .sidebar__item {
                height: 40px;
            }
        }
        `;

        this.appendChild(style);

        this.innerHTML += `
            <aside class="sidebar" id="sidebar">
                <!-- College Logo and Title -->
                <a href="#" class="sidebar__brand">
                    <img src="../asset/image/CCS-GCLOGO.png" alt="Gordon College Logo" class="sidebar__logo">
                    <span class="sidebar__title">Gordon College</span>
                </a>
                
                <!--  Main Navigation Menu -->
                <ul class="sidebar__menu sidebar__menu--main">

                <!-- User Profile -->
                <li class="sidebar__item" data-page="dashboard.html">
                    <a href="../page/dashboard.html" class="sidebar__link">
                    <i class='bx bxs-user-rectangle'></i>
                    <span class="sidebar__text">${userName}</span>
                    </a>
                </li>
                <!-- Borrower Management -->
                <li class="sidebar__item" data-page="borrower.html">
                    <a href="../page/borrower.html" class="sidebar__link">
                    <i class='bx bxs-receipt'></i>
                    <span class="sidebar__text">Borrow Item</span>
                    </a>
                </li>
                <!-- Report and Request System -->
                <li class="sidebar__item" data-page="report.html">
                    <a href="../page/report.html" class="sidebar__link">
                    <i class='bx bxs-copy-alt'></i>
                    <span class="sidebar__text">Report Item</span>
                    </a>
                </li>
                <!-- Repair Progress Tracker -->
                <li class="sidebar__item" data-page="report-list.html">
                    <a href="../page/report-list.html" class="sidebar__link">
                    <i class='bx bxs-doughnut-chart'></i>
                    <span class="sidebar__text">My Reports</span>
                    </a>
                </li>
                    <li class="sidebar__item" data-page="proposal.html">
                        <a href="../page/proposal.html" class="sidebar__link">
                            <i class='bx bxs-group'></i>
                            <span class="sidebar__text">My Proposal</span>
                        </a>
                    </li>
                </ul>

                <!-- Logout Option -->
                <ul class="sidebar__menu sidebar__menu--bottom">
                    <li class="sidebar__item logout-button">
                        <a href="#" class="sidebar__link sidebar__link--logout">
                            <i class='bx bxs-log-out-circle'></i>
                            <span class="sidebar__text">Logout</span>
                        </a>
                    </li>
                </ul>
            </aside>
        `;

        this.setActiveLink();
        this.setupLogoutHandler();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSidebarToggle());
        } else {
            this.setupSidebarToggle();
        }
    }

    setupLogoutHandler() {
        const logoutBtn = this.querySelector('.logout-button');
        
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            Swal.fire({
                title: 'CONFIRM LOGOUT',
                text: 'Are you sure you want to exit the application?',
                icon: 'question',
                iconHtml: '<img src="/asset/icons/qmark-icon.png" width="50">',
                showCancelButton: true,
                confirmButtonText: 'Yes, Log me out!',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                customClass: {
                    popup: 'logout-confirmation-modal'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Logging out...',
                        html: '<div class="loading-spinner"></div>',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        willOpen: () => {
                            sessionStorage.removeItem('auth_token');
                            sessionStorage.removeItem('email');
                            sessionStorage.removeItem('role');
                            sessionStorage.removeItem('fullName');
                            localStorage.removeItem('user');
                        }
                    });

                    setTimeout(() => {
                        console.log("User logged out successfully");
                        window.location.href = '../../index.html';
                    }, 800);
                }
            });
        });
    }

    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const sidebarItems = this.querySelectorAll('.sidebar__item');
        sidebarItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === currentPage) {
                item.classList.add('sidebar__item--active');
            } else {
                item.classList.remove('sidebar__item--active');
            }
        });
    }

    setupSidebarToggle() {
        const toggleBtn = document.querySelector('.navbar__toggle');
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('content');

        if (!toggleBtn || !sidebar || !main) {
            console.error('Sidebar toggle elements not found');
            return;
        }
        
        toggleBtn.addEventListener('click', () => {
            if (window.innerWidth <= 576) {
                sidebar.classList.toggle('show');
            } else {
                sidebar.classList.toggle('hide');
            }
            
            void sidebar.offsetWidth;
            
            main.classList.toggle('collapsed');
        });

        this.updateSidebarState();

        window.addEventListener('resize', () => this.updateSidebarState());
    }

    updateSidebarState() {
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('content');
        
        if (!sidebar || !main) return;
        
        if (window.innerWidth <= 576) {
            sidebar.classList.remove('hide');
            sidebar.classList.remove('show');
            main.classList.remove('collapsed');
        } else if (window.innerWidth <= 768) {
            sidebar.classList.remove('show');
            sidebar.classList.add('hide');
            main.classList.add('collapsed');
        } else {
            sidebar.classList.remove('hide');
            sidebar.classList.remove('show');
            main.classList.remove('collapsed');
        }
    }
}

customElements.define('app-sidebar', AppSidebar);