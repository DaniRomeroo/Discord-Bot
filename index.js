const Discord = require( 'discord.js' );
const DisTube = require( 'distube' );
const { MessageEmbed } = require('discord.js');
const { SoundCloudPlugin } = require( '@distube/soundcloud' );
const { SpotifyPlugin } = require( "@distube/spotify" );
const config = require("./info.json")
const client = new Discord.Client( {
    intents: [
        'GUILDS',
        'GUILD_VOICE_STATES',
        'GUILD_MESSAGES',
    ],
} );

const distube = new DisTube.default( client, {
    searchSongs: 1,
    searchCooldown: 5,
	leaveOnEmpty: false,
    emptyCooldown: 0,
	leaveOnFinish: true,
    plugins: [ new SoundCloudPlugin(), new SpotifyPlugin() ],
} );
const token = config.token;
const prefix = config.prefix;

client.on('ready', () => {
	console.log( `Logged in as ${ client.user.tag }!` )
	client.user.setActivity( '-help', { type: 'LISTENING' } );
} )


const playSongEmbed = new MessageEmbed()
	.setColor( '#18fc03' )
	.setTitle( ':notes: Now Playing' )

const addSongEmbed = new MessageEmbed()
	.setColor( '#18fc03' )
	.setTitle( ':white_check_mark: Added Song' )

const addPlaylistEmbed = new MessageEmbed()
	.setColor( '#18fc03' )
	.setTitle( ':white_check_mark: Added Playlist' )
	.setDescription( `Added playlist to queue` )

const noResultEmbed = new MessageEmbed()
	.setColor( '#fc0303' )
	.setTitle( ':stop_sign: No Result' )
	.setDescription( `No result found!` )

const disconnectEmbed = new MessageEmbed()
	.setColor( '#03a1fc' )
	.setTitle( ':wave: Disconnect' )
	.setDescription( 'Disconnected!' )

const errorCanalEmbed = new MessageEmbed()
	.setColor( '#fc0303' )
	.setTitle( ':stop_sign: Error' )
	.setDescription( "You are not in a voice channel!" )

const errorBotEmbed = new MessageEmbed()
	.setColor( '#fc0303' )
	.setTitle( ':stop_sign: Error' )
	.setDescription( "You need to be at the same channel as bot!" )

const errorQueueEmbed = new MessageEmbed()
	.setColor( '#fc0303' )
	.setTitle( ':stop_sign: Error' )
	.setDescription( "There's nothing playing right now!" )


client.on( 'messageCreate', message => 
{
	if ( message.author.bot ) return 
	if ( !message.content.startsWith( prefix ) ) return 
	const args = message.content.slice( prefix.length ).trim().split( / +/g )
	const command = args.shift()
	const queue = distube.getQueue( message )
	
	if ( command == "p" ) //play
	{
		const errorEmbed = new MessageEmbed()
		.setColor( '#fc0303' )
		.setTitle( ':stop_sign: Error' )
		.setDescription( "You need to specify song or playlist!" )
		
		if ( !message.member.voice.channel ) return message.channel.send( { embeds: [ errorCanalEmbed ] } )
		if ( !args[ 0 ] ) return message.channel.send( { embeds: [ errorEmbed ] } )
		if ( message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id )
			return message.channel.send( { embeds: [ errorBotEmbed ] } )
		distube.play( message, args.join( " " ) )

	}

	else if ( [ 'loop' ].includes( command ) ) 
	{
		if ( !message.member.voice.channel ) return message.channel.send({ embeds: [errorCanalEmbed] })
		if ( !queue ) return message.channel.send({ embeds: [errorQueueEmbed] })
		if ( message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id )
			return message.channel.send( { embeds: [ errorBotEmbed ] } )
		const mode = distube.setRepeatMode( message )
		const loopEmbed = new MessageEmbed()
		.setColor( '#03a1fc' )
		.setTitle( ':repeat: Loop' )
		.setDescription( `Loop Mode: \`${ mode ? mode === 2 ? 'All Queue' : 'This Song' : 'Off' }\`` )
		message.channel.send(  { embeds: [ loopEmbed ] } )
	}

	else if ( command == "disconnect" ) //disconnect
	{
		if ( !message.member.voice.channel ) return message.channel.send({ embeds: [errorCanalEmbed] })
		if ( message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id )
			return message.channel.send( { embeds: [ errorBotEmbed ] } )
		distube.stop( message )
	}

	else if ( command === 'stop' ) //stop
	{
		if ( !message.member.voice.channel ) return message.channel.send( { embeds: [ errorCanalEmbed ] } )
		if ( !queue ) return message.channel.send( { embeds: [ errorQueueEmbed ] } )
		if ( message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id )
			return message.channel.send( { embeds: [ errorBotEmbed ] } )
		distube.pause( message )
		const stopEmbed = new MessageEmbed()
		.setColor( '#03a1fc' )
		.setTitle( ':mute: Stop' )
		.setDescription( "Music stopped!" )
		message.channel.send({ embeds: [stopEmbed] })

	}

	else if ( command === 'resume' ) //resume
	{
		if ( !message.member.voice.channel ) return message.channel.send({ embeds: [errorCanalEmbed] })
		if ( !queue ) return message.channel.send({ embeds: [errorQueueEmbed] })
		if ( message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id )
			return message.channel.send( { embeds: [ errorBotEmbed ] } )
		try
		{
			distube.resume( message )
			const playingEmbed = new MessageEmbed()
			.setColor( '#18fc03' )
			.setTitle( ':loud_sound: Resume' )
			.setDescription( "Music playing!" )
			message.channel.send({ embeds: [playingEmbed] })
		} catch ( error )
		{
			const errorEmbed = new MessageEmbed()
			.setColor( '#fc0303' )
			.setTitle( ':stop_sign: Error' )
			.setDescription( "Action cannot be done!" )
			message.channel.send({ embeds: [errorEmbed] })
		}
		
		
	}		
	else if ( command === 'n' ) //skip
	{
		if ( !message.member.voice.channel ) return message.channel.send( { embeds: [ errorCanalEmbed ] } )
		if ( !queue ) return message.channel.send({ embeds: [errorQueueEmbed] })
		if ( message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id )
			return message.channel.send( { embeds: [ errorBotEmbed ] } )
		
		if ( queue.songs.length == 1 )
		{
			const errorEmbed = new MessageEmbed()
			.setColor( '#fc0303' )
			.setTitle( ':stop_sign: Error' )
			.setDescription( "Action cannot be done!" )
			message.channel.send({ embeds: [errorEmbed] })
		} else
		{
			distube.skip(message)
		}
	}
		
	else if ( command === 'queue' ) //queue
	{
		if ( !message.member.voice.channel ) return message.channel.send({ embeds: [errorCanalEmbed] })
		if ( message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id )
			return message.channel.send( { embeds: [ errorBotEmbed ] } )
		if ( !queue ) return message.channel.send( { embeds: [ errorQueueEmbed ] } )
		const queueEmbed = new Discord.MessageEmbed()
		.setColor( '#03a1fc' )
		.setTitle("Queue")
		.setDescription( `\n${ queue.songs.map( ( song, id ) => `**${ id ? id : 'Playing'}**: \`${ song.name }\`` ).slice( 0, 100 ).join( '\n' ) }` )
		message.channel.send({ embeds: [queueEmbed] })

	}
	
	else if ( command === 'clear' ) //clear
	{
		const helpEmbed = new Discord.MessageEmbed()
		.setColor( '#03a1fc' )
		.setTitle(":stop_sign: Clear")
		.setDescription('Clear command in progress...')
		message.channel.send({ embeds: [helpEmbed] })
	}	
		
	else if ( command === 'help' ) //queue
	{
		const helpEmbed = new Discord.MessageEmbed()
		.setColor( '#03a1fc' )
		.setTitle(":clipboard: Commands")
			.setDescription( `**-p:** Play Song\n\n**-stop:** Stops music\n\n**-n:** Next song\n\n**-resume:** Play music again\n
							**-queue:** Shows queue\n\n**-loop:** Set loop mode\n\n**-clear:** Clear all songs( Working...)\n\n**-disconnect:** Disconnect bot`)
		message.channel.send({ embeds: [helpEmbed] })
	}

	else
	{
		const errorEmbed = new MessageEmbed()
		.setColor( '#fc0303' )
		.setTitle( ':stop_sign: Error' )
		.setDescription( "This command doesn't exists!" )
		message.channel.send({ embeds: [errorEmbed] })
	}
} )

distube
	.on( 'playSong', ( queue, song ) =>
		queue.textChannel.send( { embeds: [ playSongEmbed.setDescription( `\`${ song.name }\` - \`${ song.formattedDuration }\`\nRequested by: ${ song.user }` ) ] } ) )
	.on( 'addSong', ( queue, song ) =>
		queue.textChannel.send({ embeds: [ addSongEmbed.setDescription( `\`${ song.name }\`` ) ] }))
	.on('addList', (queue) => queue.textChannel.send( { embeds: [ addPlaylistEmbed ] } ))
	.on('searchNoResult', message => message.channel.send( { embeds: [ noResultEmbed ] } ))
	.on( 'disconnect', queue => queue.textChannel.send( { embeds: [ disconnectEmbed ] } ) )
	.on('error', (e) => {console.error(e)})
	
client.login( token )