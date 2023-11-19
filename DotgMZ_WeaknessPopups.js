//=============================================================================
// Dynamic Open Toolbox for Games MZ - Weakness Popups
// DotgMZ_WeaknessPopups.js
//=============================================================================

var Imported = Imported || {};
Imported.DotgMZ_WeaknessPopups = true;

var DotgMZ = DotgMZ || {};
DotgMZ.WeaknessPopups = DotgMZ.WeaknessPopups || {};
DotgMZ.WeaknessPopups.version = "0.1-alpha";

/*~struct~Vector:
 * @param x
 * @type number
 * @default 0
 *
 * @param y
 * @type number
 * @default 0
 */

/*~struct~Animation:
 * @param duration
 * @description The animation length
 * @type number
 * @default 1
 * 
 * @param displacement
 * @description By how much should the image move during the animation?
 * @type struct<Vector>
 * @default {"x": "-50", "y": "0"}
 * 
 * @param initial scale
 * @description What scale should the image be when it first appears?
 * @type struct<Vector>
 * @default {"x": "1.5", "y": "1.5"}
*/

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.0.0-dev) Create popups that appear in battle when certain 
 * @url https://abcight.com
 * @target MZ
 * @author Team GG
 *
 * @param Ineffective Image
 * @name ineffectiveImage
 * @desc The image to use when ineffective damage was dealt
 * @type file
 * @dir img/system
 *
 * @param Effective Image
 * @name effectiveImage
 * @desc The image to use when effective damage was dealt
 * @type file
 * @dir img/system
 * 
 * @param Immune Image
 * @name immuneImage
 * @desc The image to use when damage was dealt to a target with type immunity
 * @type file
 * @dir img/system
 * 
 * @param Critical Image
 * @name criticalImage
 * @desc The image to use when critical damage was dealt
 * @type file
 * @dir img/system
 * 
 * @param Critical Image
 * @name criticalImage
 * @desc The image to use when critical damage was dealt
 * @type file
 * @dir img/system
 * 
 * @param Offset
 * @name offset
 * @desc The offset for effective/ineffective/immune displays
 * @type struct<Vector>
 * 
 * @param Critical Offset
 * @name offset
 * @desc The offset for critical displays
 * @type struct<Vector>
 * 
 * @param Animation
 * @name animation
 * @desc Advanced animation properties
 * @type struct<Animation>
 *
 * @help
 *   DOTG: Weakness Popups
 * ----------------------------------------------------------------------------
 * This plugin will enable you to show various messages when dealing damage 
 * during combat:
 * - Generate battle popups whenever battlers experience elemental damage, indicating weaknesses, resistances and immunities.
 * - Critical hits will trigger additional popups.
 * - Use your own images for easy popup customization.
 * - Employ various methods such as scaling and displacement to animate the movement of popups.
 * - Tailor the appearance of popups based on different elemental rates, creating varied displays corresponding to the rate of elemental impact.
 */

(() => {
	//===================================================================
	// Parsing plugin parameters
	//===================================================================

	let parameters = PluginManager.parameters("DotgMZ_WeaknessPopups");

	let ineffectiveImage = parameters["Ineffective Image"];
	let effectiveImage = parameters["Effective Image"];
	let immuneImage = parameters["Immune Image"];
	let criticalImage = parameters["Critical Image"];

	let offset = JSON.parse(parameters["Offset"]);
	offset.x *= 1.0;
	offset.y *= 1.0;

	let criticalOffset = JSON.parse(parameters["Critical Offset"]);
	criticalOffset.x *= 1.0;
	criticalOffset.y *= 1.0;

	let animation = JSON.parse(parameters["Animation"])
	animation.displacement = JSON.parse(animation["displacement"]);
	animation.displacement.x *= 1.0;
	animation.displacement.y *= 1.0;

	animation.initial_scale = JSON.parse(animation["initial scale"]);
	animation.initial_scale.x *= 1.0;
	animation.initial_scale.y *= 1.0;
	animation.duration *= 1.0;

	//===================================================================
	// Displaying the popups
	//===================================================================

	function displayFor(target, systemImage, offset) {
		let actor = DotgMZ.Core.makeActor();
		actor.sprite = DotgMZ.Core.makeSprite(systemImage);
		actor.sprite.anchor.x = 0.5;
		actor.sprite.anchor.y = 0.5;
		actor.time = 0;
		
		actor.update = function() {
			let sprite = actor.sprite;
			let target_sprite = DotgMZ.Core.getActorSprite(target);

			let center_x = target_sprite.x + offset.x;
			let center_y = target_sprite.y - target_sprite.height + offset.y;

			sprite.x = center_x;
			sprite.y = center_y;

			if(actor.time <= 0.2 * animation.duration) {
				let t = actor.time / (0.2 * animation.duration);

				sprite.scale.x = (1.0 - t) * animation.initial_scale.x + t;
				sprite.scale.y = (1.0 - t) * animation.initial_scale.y + t;
			} else {
				let t = (actor.time - 0.2 * animation.duration) / (0.8 * animation.duration);
				let offset_x = (1 - Math.pow(1 - t, 3)) * animation.displacement.x;
				let offset_y = (1 - Math.pow(1 - t, 3)) * animation.displacement.y;
				sprite.x += offset_x;
				sprite.y += offset_y;

				sprite.scale.x = 1.0;
				sprite.scale.y = 1.0;

				if(t >= 0.8) {
					sprite.alpha = 1.0 - ((t - 0.8) / 0.2);
				}
			}
			
			actor.time += 0.016;

			if(actor.time >= animation.duration) {
				DotgMZ.Core.removeSprite(sprite);
				DotgMZ.Core.removeActor(actor);
			}
		}
	}

	let executeDamage = Game_Action.prototype.executeDamage;
	Game_Action.prototype.executeDamage = function(target, value) {
		executeDamage.apply(this, arguments);

		let rate = this.calcElementRate(target);

		if(rate <= 0.0) {
			displayFor(target, immuneImage, offset);
		} else if(rate < 1.0) {
			displayFor(target, ineffectiveImage, offset);
		} else if (rate > 1.0) {
			displayFor(target, effectiveImage, offset);
		}

		if(target.result().critical) {
			displayFor(target, criticalImage, criticalOffset);
		}
	};
})()