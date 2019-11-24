customElements.define("wc-gallery",
	class extends HTMLElement {
		static get observedAttributes(){
			return [];
		}
		constructor(){
			super();
			this.bind(this);
		}
		bind(element){
			element.attachEvents = element.attachEvents.bind(element);
			element.cacheDom = element.cacheDom.bind(element);
			element.connectFileSystem = element.connectFileSystem.bind(element);
			element.keydown = element.keydown.bind(element);
		}
		connectedCallback(){
			this.render();
			this.cacheDom();
			this.attachEvents();
		}
		render(){
			this.attachShadow({ mode: "open"});
			this.shadowRoot.innerHTML = `
				<style>
					:host { display: block; background-color: #efefef; height: 100%; width: 100%; background-position: center center; background-repeat: no-repeat; cursor: pointer; }
					:host { background-image: url('data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="32" width="256"><text font-family="arial" x="16" y="20" font-size="24">Click to open gallery</text></svg>'); }
					:host.loaded { background: none; }
					#gallery { display: grid; grid-gap: 1rem; grid-template-columns: repeat(auto-fit, 320px); grid-template-rows: repeat(auto-fit, 320px); user-select: none; }
					#gallery img.tall { height: 320px; width: auto; }
					#gallery img.wide { height: auto; width: 320px; }
				</style>
				<dialog>
					<img />
				</dialog>
				<div id="gallery"></div>
			`;
		}
		cacheDom(){
			this.dom = {
				gallery: this.shadowRoot.querySelector("#gallery"),
				dialog: this.shadowRoot.querySelector("dialog"),
				dialogImage: this.shadowRoot.querySelector("dialog img")
			};
		}
		attachEvents(){
			this.addEventListener("click", this.connectFileSystem);
			this.addEventListener("keydown", this.keydown);
		}
		async connectFileSystem(){
			this.handle = await window.chooseFileSystemEntries({type: "openDirectory"});
			const entries = await this.handle.getEntries();
			this.classList.add("loaded");
			for await (const entry of entries) {
				if(entry.isFile){
					const file = await entry.getFile();
					const arrayBuffer = await file.arrayBuffer();
					const blob = new Blob([ arrayBuffer ]);
					const url = URL.createObjectURL(blob);
					const image = document.createElement("img");
					image.src = url;
					this.dom.gallery.appendChild(image);
					image.onload = () => {
						image.classList.add(image.width > image.height ? "wide" : "tall");
						URL.revokeObjectURL(url);
					};
					image.addEventListener("click", () => {
						const url = URL.createObjectURL(blob);
						this.dom.dialogImage.src = url;
						this.dom.dialogImage.onload = () => URL.revokeObjectURL(url);
						this.dom.dialog.showModal();
					});
				}
			}
		}
		keydown(e){
			if(e.keyCode === 32){
				this.dom.dialog.close();
			}
		}
		attributeChangedCallback(name, oldValue, newValue){
			this[name] = newValue;
		}
	}
)
