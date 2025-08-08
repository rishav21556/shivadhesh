let category_list = ['All','Books and Media','Sports and Fitness','Beauty and Personal Care','Home and Kitchen','Fashion','Electronics'];
// let category_list = []
let category = document.getElementsByClassName("categories-dropdown");
console.log(`category: ${category}`);
category = category[0];

for (let i =0 ;i < category_list.length; i++){
    let list_item = document.createElement("li");
    let link  = document.createElement("a");
    link.className = "dropdown-item";
    link.href = "http://127.0.0.1:8000/users/home/"+category_list[i];
    link.textContent = category_list[i];
    list_item.appendChild(link);
    category.appendChild(list_item);
}


autocomplete_block = document.getElementsByClassName("autocomplete");
autocomplete_block = autocomplete_block[0];

search_bar = document.getElementById('search');
search_bar.addEventListener('input',function(){
    cont = document.getElementsByClassName('search-container');
    console.log(cont);
    if (cont.length>0){
        autocomplete_block.removeChild(cont[0]);
    }
    if (search_bar.value){
        jQuery.ajax({
            url : 'http://127.0.0.1:8000/users/autocomplete/' + search_bar.value,
            method : 'GET',
            datatype : 'json',
            success : function(response){
                let product = response['product_name'];
                let id = response['product_id'];
                container = document.createElement('DIV');
                container.className = 'search-container';
                container.style.position  = 'absolute';
                container.style.width = autocomplete_block.offsetWidth + 'px';
                autocomplete_block.appendChild(container);
                for (let j = 0 ; j < product.length;j++){
                    carry = document.createElement('a');
                    carry.className = 'search-carry dropdown-item';
                    carry.href = "http://127.0.0.1:8000/users/home/product/" + id[j];
                    carry.innerHTML = product[j];
                    container.appendChild(carry); 
                }
                
            },
            error: function(xhr, status, error) {
                // The callback function to be executed when an error occurs
                console.log('An error occurred:', error);
            }
        })
    }
    
});




