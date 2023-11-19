//=============================================================================
// Dynamic Open Toolbox for Games MZ - Core
// DotgMZ_Core.js
//=============================================================================

var Imported = Imported || {};
Imported.DotgMZ_Core = true;

var DotgMZ = DotgMZ || {};
DotgMZ.Core = DotgMZ.Core || {};
DotgMZ.Core.version = "0.1-alpha";

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.0.0-dev) Common utilities for the DOTG plugin collection
 * @url https://abcight.com
 * @target MZ
 * @author Team GG
 *
 * @help
 *   DOTG: Core
 * ----------------------------------------------------------------------------
 * This plugin is a set of common utility functions necessary for the DOTG
 * plugin collection to work as intended.
 */

if(!DotgMZ.Core) {
	let core = {
		targetLayer: null,
		battleSpriteMap: {},
		actors: [],
		version: "0.0-dev"
	};

	core.makeSprite = function(systemImage) {
		let bitmap = ImageManager.loadSystem(systemImage);
		let sprite = new Sprite(bitmap);
		core.targetLayer?.addChild(sprite);
		return sprite;
	};

	core.removeSprite = function(sprite) {
		core.targetLayer.removeChild(sprite);
	};

	core.makeActor = function() {
		let actor = {
			sprite: null,
			update: function () {},
		};
		core.actors.push(actor);
		return actor;
	};

	core.removeActor = function(actor) {
		core.actors = core.actors.filter(x => x != actor);
	};

	core.update = function() {
		core.actors.forEach(x => x.update());
	};

	core.getActorSprite = function (actor) {
		if(!actor)
			return null;
		return core.battleSpriteMap[actor.__dotgCoreId];
	}

	DotgMZ.Core = core;
}

(() => {
	let setBattler = Sprite_Battler.prototype.setBattler;
	Sprite_Battler.prototype.setBattler = function(battler) {
		setBattler.apply(this, arguments);
		if (battler) {
			if(!battler.__dotgCoreId) {
				battler.__dotgCoreId = Math.floor(Math.random() * 10000000);
			}
			DotgMZ.Core.battleSpriteMap[battler.__dotgCoreId] = this;
		}
	};

	let create = Scene_Battle.prototype.create;
	Scene_Battle.prototype.create = function() {
		DotgMZ.Core.battleSpriteMap = {};
		DotgMZ.Core.actors = [];
		
		create.apply(this, arguments);

		DotgMZ.Core.targetLayer = SceneManager._scene.children[0].children[0].children[4];
		overlay = new PIXI.Graphics();
		DotgMZ.Core.targetLayer.addChild(overlay);
		DotgMZ.Core.targetLayer = overlay;
	};

	let update = Scene_Battle.prototype.update;
	Scene_Battle.prototype.update = function() {
		update.apply(this, arguments);
		DotgMZ.Core.update();
	};
})();