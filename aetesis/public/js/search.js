
function prepare_search() {
    $(".toolbar").append(`
        <div class="input-group p-0">
            <div class="dropdown w-100" id="dropdownMenuSearch">
                <input type="search" name="query" id="search-box" class="form-control font-md"
                    placeholder="Search for Products"
                    aria-label="Product" aria-describedby="button-addon2">
                <div class="search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-search">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <!-- Results dropdown rendered in product_search.js -->
            </div>
        </div>
    `);
}

frappe.ready(() => {
    $('.nav-bottom').append(`
        <div id="nav-search" class="toolbar col-4">
        </div>
    `);
    prepare_search();

    new aetesis.ProductSearch();
});