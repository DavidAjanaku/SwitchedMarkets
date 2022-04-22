import View from "./View.js";


class LinkMenu extends View {
    _parentEl = document.querySelector('.link-menu');

    _generateMarkup(){
        return `
            <li class="nav-item">
                <a href="account-overview.html#${this._data.id}" class="nav-link">
                    <i class="mdi mdi-bullseye"></i>
                    <span>Overview</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="account-deposit.html#${this._data.id}" class="nav-link">
                    <i class="mdi mdi-heart"></i>
                    <span>Deposit</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="account-withdraw.html#${this._data.id}" class="nav-link">
                    <i class="mdi mdi-pentagon"></i>
                    <span>Withdraw</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="account-api.html#${this._data.id}" class="nav-link">
                    <i class="mdi mdi-database"></i>
                    <span>API</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="account-affiliate.html#${this._data.id}" class="nav-link">
                    <i class="mdi mdi-diamond"></i>
                    <span>Affiliate</span>
                </a>
            </li>
        `;
    }
}

export default new LinkMenu();