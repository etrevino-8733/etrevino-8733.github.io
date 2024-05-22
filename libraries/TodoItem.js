import './TodoItem.css'
class TodoItem extends HTMLElement {
    constructor() {
        super()
        this.innerHTML = `
        <div class="collapsible-nav">
            <button class="et-button collapsible-nav-btn"><i class="fa fa-solid fa-bars"></i></button>
            <nav class="collapsible-nav-content">
                <ul>
                    <li ><a class="nav-button et-button" href="index.html">Home</a></li>
                    <li ><a class="nav-button et-button" href="#projects">Projects</a></li>
                    <!-- <li ><a class="nav-button et-button" href="#contactMe">Contact</a></li> -->
                </ul>
            </nav>
        </div>
        <div id="logoSmallBox">
            <span>ET Tech</span>
        </div>
        <nav class="main-nav">
            <ul>
                <li ><a class="nav-button et-button" href="index.html">Home</a></li>
                <li ><a class="nav-button et-button" href="#projects">Projects</a></li>
                <!-- <li ><a class="nav-button et-button" href="#contactMe">Contact</a></li> -->
            </ul>
        </nav>`
    }

    connectedCallback() {
        console.log('connected')
    }
}

customElements.define('todo-item', TodoItem);