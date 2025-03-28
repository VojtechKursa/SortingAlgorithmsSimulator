import { animationsCheckboxWrapperClass, selectWrapperClass as rendererSelectWrapperClass, visualizationOptionsWrapperId } from "../visualization/css/VisualizationOptionsClasses";
import { SvgRenderer } from "../visualization/rendering/SvgRenderer";

/**
 * An interface for handler that handles changes in animations enabled state.
 */
export interface AnimationsEnabledChangeHandler { (enabledNow: boolean): void }

/**
 * An interface for handler that handles changes of active renderer.
 */
export interface RendererChangedHandler { (newRenderer: SvgRenderer | null, previousRenderer: SvgRenderer | null): void }

/**
 * Controller for managing the visualization options.
 */
export class VisualizationOptionsController {
	private readonly rendererSelector: HTMLSelectElement;
	private readonly animationsCheckbox: HTMLInputElement;

	private readonly renderers: ReadonlyMap<string, SvgRenderer>;
	private lastRenderer: SvgRenderer | null;

	private readonly animationsEventListeners: AnimationsEnabledChangeHandler[] = [];
	private readonly rendererEventListeners: RendererChangedHandler[] = [];

	/**
	 * @param wrapper Wrapper into which to create the controller's UI elements.
	 * @param renderers Array of renderers to be available in the simulator.
	 * @param defaultRenderer The renderer that's selected by default. If not provided, the first renderer in the array is selected. Null to not select any renderer.
	 * @param animationsEnabled Whether animations are enabled by default.
	 */
	public constructor(
		wrapper: HTMLDivElement,
		renderers: readonly SvgRenderer[],
		defaultRenderer?: SvgRenderer | null,
		animationsEnabled: boolean = true,
	) {
		const visualizationOptionsWrapper = document.createElement("div");
		visualizationOptionsWrapper.id = visualizationOptionsWrapperId;

		const completeRenderers: SvgRenderer[] = [...renderers];
		if (defaultRenderer == undefined) {
			if (completeRenderers.length > 0) {
				defaultRenderer = completeRenderers[0];
			} else {
				defaultRenderer = null;
			}
		}
		else if (defaultRenderer != null) {
			const defaultRendererInArray = completeRenderers.find(val => val == defaultRenderer);
			if (defaultRendererInArray == undefined) {
				completeRenderers.unshift(defaultRenderer);
			}
		}
		this.lastRenderer = defaultRenderer;

		const checkboxOuterWrapper = document.createElement("div");
		checkboxOuterWrapper.classList.add(animationsCheckboxWrapperClass);

		const checkboxWrapper = document.createElement("div");
		checkboxWrapper.classList.add("form-check", "form-switch");

		this.animationsCheckbox = document.createElement("input");
		this.animationsCheckbox.type = "checkbox";
		this.animationsCheckbox.role = "switch";
		this.animationsCheckbox.classList.add("form-check-input");
		this.animationsCheckbox.id = "animations-checkbox";
		if (animationsEnabled) {
			this.animationsCheckbox.checked = true;
		}

		checkboxWrapper.appendChild(this.animationsCheckbox);

		const checkboxLabel = document.createElement("label");
		checkboxLabel.textContent = "Animations";
		checkboxLabel.setAttribute("for", this.animationsCheckbox.id);

		checkboxOuterWrapper.appendChild(checkboxLabel);
		checkboxOuterWrapper.appendChild(checkboxWrapper);


		const rendererSelectorWrapper = document.createElement("div");
		rendererSelectorWrapper.classList.add(rendererSelectWrapperClass);

		const selectWrapper = document.createElement("div");

		this.rendererSelector = document.createElement("select");
		this.rendererSelector.classList.add("form-select");
		this.rendererSelector.id = "renderer-select";

		const rendererMap = new Map<string, SvgRenderer>();

		for (const renderer of completeRenderers) {
			const option = document.createElement("option");
			option.value = renderer.machineName;
			option.text = renderer.displayName;

			this.rendererSelector.appendChild(option);

			if (renderer == defaultRenderer) {
				option.selected = true;
			}

			rendererMap.set(renderer.machineName, renderer);
		}

		this.renderers = rendererMap;

		selectWrapper.appendChild(this.rendererSelector);

		const selectorLabel = document.createElement("label");
		selectorLabel.textContent = "Renderer";
		selectorLabel.setAttribute("for", this.rendererSelector.id);

		rendererSelectorWrapper.appendChild(selectorLabel);
		rendererSelectorWrapper.appendChild(selectWrapper);


		visualizationOptionsWrapper.appendChild(rendererSelectorWrapper);
		visualizationOptionsWrapper.appendChild(checkboxOuterWrapper);

		wrapper.appendChild(visualizationOptionsWrapper);

		this.animationsCheckbox.addEventListener("change", () => {
			for (const listener of this.animationsEventListeners) {
				listener(this.animationsCheckbox.checked);
			}
		});

		this.rendererSelector.addEventListener("change", () => this.rendererSelectorChangedHandler());
	}

	/**
	 * Gets the currently selected renderer, or null if no renderer is selected.
	 */
	public get currentRenderer(): SvgRenderer | null {
		const selectedIndex = this.rendererSelector.selectedIndex;
		if (selectedIndex < 0 || selectedIndex >= this.rendererSelector.options.length)
			return null;

		const selectedOption = this.rendererSelector.options[selectedIndex];

		const selectedRenderer = this.renderers.get(selectedOption.value);

		return selectedRenderer ?? null;
	}

	/**
	 * Gets whether animations are currently enabled.
	 */
	public get animationsEnabled(): boolean {
		return this.animationsCheckbox.checked;
	}

	private rendererSelectorChangedHandler() {
		const currentRenderer = this.currentRenderer;

		for (const listener of this.rendererEventListeners) {
			listener(currentRenderer, this.lastRenderer)
		}

		this.lastRenderer = currentRenderer;
	}



	public registerAnimationsChangedHandler(handler: AnimationsEnabledChangeHandler): void {
		this.animationsEventListeners.push(handler);
	}

	public unregisterAnimationsChangedHandler(handler: AnimationsEnabledChangeHandler): void {
		const index = this.animationsEventListeners.findIndex(val => val == handler);

		if (index != -1) {
			this.animationsEventListeners.splice(index, 1);
		}
	}

	public registerRendererChangedHandler(handler: RendererChangedHandler): void {
		this.rendererEventListeners.push(handler);
	}

	public unregisterRendererChangedHandler(handler: RendererChangedHandler): void {
		const index = this.rendererEventListeners.findIndex(val => val == handler);

		if (index != -1) {
			this.rendererEventListeners.splice(index, 1);
		}
	}
}