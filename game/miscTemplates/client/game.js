Template.game.helpers({
	rp_template: function() {
		var template = Session.get('rp_template')
		if (template) {
			return template
		} else {
			return 'empty_template'
		}
	},

	rp_template_data: function() {
		switch (Session.get('selected_type')) {
			case 'castle':
				return RightPanelCastle.findOne(Session.get('selected_id'))
				break;
			case 'village':
				return RightPanelVillages.findOne(Session.get('selected_id'))
				break;
			case 'army':
				return RightPanelArmies.findOne(Session.get('selected_id'))
				break;
			case 'hex':
				return Hexes.findOne(Session.get('selected_id'))
				break;
		}
		return {}
	},
    show_info_panel: function() { return Session.get('show_info_panel') },
	show_summary_panel: function() { return Session.get('show_summary_panel') },
	show_admin_panel: function() { return Session.get('show_admin_panel') },
	show_market_panel: function() { return Session.get('show_market_panel') },
	show_settings_panel: function() { return Session.get('show_settings_panel') },
	show_chatrooms_panel: function() { return Session.get('show_chatrooms_panel') },
	show_forum_panel: function() { return Session.get('show_forum_panel') },
	show_rankings_panel: function() { return Session.get('show_rankings_panel') },
	show_notifications_panel: function() { return Session.get('show_notifications_panel') },
	show_help_panel: function() { return Session.get('show_help_panel') },
	show_stats_panel: function() { return Session.get('show_stats_panel') },
	show_store_panel: function() { return Session.get('show_store_panel') },
	show_tree_panel: function() { return Session.get('show_tree_panel') },


	show_welcome_screen: function() {
		if (!Session.get('show_building_castle_modal')) {
			var res = Meteor.users.findOne(Meteor.userId(), {fields: {show_welcome_screen: 1}})
			if (res) {
				if (res.show_welcome_screen) {
					return true
				}
			}
			return false
		}
	},


})

Template.game.events({
	// grid drag. Only start dragging if starting within #hex_body; continue dragging everywhere.
	'mousedown #hex_body': function(event, template) {
		if (event.which == 1) { // left mouse button
			dragger.start_grid_drag(event, false)
		}
	},
	'mouseup': function(event, template) { dragger.stop_grid_drag() },
	'mousemove': function(event, template) { dragger.hexes_mouse_move(event, false) },

	'touchstart #hex_body': function(event, template) { dragger.start_grid_drag(event, true) },
	'touchend': function(event, template) { dragger.stop_grid_drag() },
	'touchmove': function(event, template) { dragger.hexes_mouse_move(event, true) }
})




var width = $(window).outerWidth(true)
var height = $(window).outerHeight(true)
Session.set('canvas_size', {width: 0, height: 0, half_width: 0, half_height: 0})	// set to zero so that deps.autorun will run again
Session.set('canvas_size', {width: width, height: height, half_width: width/2, half_height: height/2})



Template.game.created = function() {
	var self = this

	// subscribe to what's onscreen
	// uses meteor package meteorhacks:subs-manager
	subs = new SubsManager({cacheLimit:10, expireIn:5})


	// round to nearest x so that there is more of a chance of subscribing to a previous subscription
	var roundTo = 5
	self.roundedCenterHex_x = new ReactiveVar(0)
	self.roundedCenterHex_y = new ReactiveVar(0)
	this.autorun(function() {
		var center_hex = Session.get('center_hex')
		if (center_hex) {
			self.roundedCenterHex_x.set(Math.round(center_hex.x / roundTo) * roundTo)
			self.roundedCenterHex_y.set(Math.round(center_hex.y / roundTo) * roundTo)
		}
	})


	this.autorun(function() {
		if (!Session.get('is_dragging_hexes')){
			var roundedCenterHex_x = self.roundedCenterHex_x.get()
			var roundedCenterHex_y = self.roundedCenterHex_y.get()
			var canvas_size = Session.get('canvas_size')
			var hex_scale = get_hex_scale()
			var sub = subs.subscribe('on_screen', roundedCenterHex_x, roundedCenterHex_y, s.hex_size, canvas_size.width, canvas_size.height, hex_scale)
			var sub_hexes = subs.subscribe('on_screen_hexes', roundedCenterHex_x, roundedCenterHex_y, s.hex_size, canvas_size.width, canvas_size.height, hex_scale)
			Session.set('subscription_ready', sub_hexes.ready())
		}
	})

	// keep track of how many villages you have
	this.autorun(function() {
		var num_villages = LeftPanelVillages.find({user_id:Meteor.userId()}).count()
		if (num_villages) {
			Session.set('num_villages', num_villages)
		} else {
			Session.set('num_villages', 0)
		}
	})
}




Template.game.rendered = function() {
	window.onresize = function() {
		var width = $(window).outerWidth(true)
		var height = $(window).outerHeight(true)
		Session.set('canvas_size', {width: width, height: height, half_width: width/2, half_height: height/2})
	}


	// show loading map panel
	this.autorun(function() {
		if (Session.get('subscription_ready')) {
			$('#subscription_ready_panel').fadeOut(50)
		} else {
			$('#subscription_ready_panel').fadeIn(50)
		}
	})
}




Meteor.startup(function () {
	Meteor.subscribe('user_data')
})
